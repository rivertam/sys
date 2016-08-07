// sysgo hahahaha

package main

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/websocket"
	"github.com/pkg/browser"
	"net/http"
	"os/exec"
	"regexp"
	"strconv"
	"strings"
)

const FRONTEND_PATH = "./frontend/dist"
const INDEX_LOCATION = "./frontend/dist/index.html"
const FLIRTY_REQUEST_FORMAT = "^Hey babe, can I get your ([^\\s]+)\\?$"
const RESPONSE_PRELUDE = "Of course, my sugar <3 "

func indexHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}

	http.ServeFile(w, r, INDEX_LOCATION)
}

func parseMpstatOutput(o string) (data []float64) {
	lines := regexp.MustCompile("\n").Split(o, -1)
	const COLUMN_LENGTH = 4
	idleIndex := -1
	firstLineFound := false
	for i, line := range lines {
		if i > len(lines)/2 {
			// mpstat gives 2 versions of the same thing or something
			// honestly I'm not positive this data is exactly "accurate"
			break
		}
		if idleIndex != -1 {
			if len(line) < idleIndex+COLUMN_LENGTH {
				continue
			}
			if !firstLineFound {
				firstLineFound = true
				continue
			}
			idleAmount, err := strconv.ParseFloat(line[idleIndex:idleIndex+COLUMN_LENGTH], 32)
			if err != nil {
				continue
			}
			data = append(data, 100.0-idleAmount)
		} else {
			idleIndex = strings.Index(line, "%idle")
		}
	}

	return data
}

func fetchCpuUsage() string {
	result, err := exec.Command("mpstat", "1", "1", "-P", "ALL").Output()
	if err != nil {
		return fmt.Sprintf("couldn't run mpstat because %s", err)
	}

	response, err := json.Marshal(parseMpstatOutput(string(result)))
	if err != nil {
		return "some sort of encoding error!!!"
	}

	return RESPONSE_PRELUDE + "cpu:" + string(response)
}

func fetchLoad() string {
	result, err := exec.Command("uptime").Output()
	if err != nil {
		return fmt.Sprintf("couldn't run uptime because %s", err)
	}

	loadRegexp := regexp.MustCompile("load average: ([\\d\\.]+), ([\\d\\.]+), ([\\d\\.]+)")
	matches := loadRegexp.FindAllStringSubmatch(string(result), -1)
	if len(matches) < 1 {
		return "I dunno I guess we're down"
	}

	numbersAsStrings := matches[0][1:]
	var numbers []float64
	for _, s := range numbersAsStrings {
		n, err := strconv.ParseFloat(s, 32)
		if err != nil {
			n = 0
		}
		numbers = append(numbers, n)
	}
	response, err := json.Marshal(numbers)
	if err != nil {
		return "some sort of encoding error!!!"
	}

	return RESPONSE_PRELUDE + "load:" + string(response)
}

func fetchUptime() string {
	// who wants to parse "uptime" not me that's who
	result, err := exec.Command("cat", "/proc/uptime").Output()
	if err != nil {
		return fmt.Sprintf("couldn't cat /proc/uptime because %s", err)
	}

	uptimeRegexp := regexp.MustCompile("(\\d+)")
	matches := uptimeRegexp.FindAllStringSubmatch(string(result), 1)
	if len(matches) < 1 {
		return "I dunno I guess we're down"
	}

	return RESPONSE_PRELUDE + "uptime:" + matches[0][1]
}

func fetchResource(name string) string {
	switch strings.ToLower(name) {
	case "cpu":
		return fetchCpuUsage()
	case "load":
		return fetchLoad()
	case "uptime":
		return fetchUptime()
	case "memory":
		return "8.45gb / 12gb"
	default:
		return "????"
	}
}

var upgrader = websocket.Upgrader{}

func websocketHandler(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Printf("Can't upgrade to socket for this reason: %s", err)
		return
	}

	defer c.Close()
	for {
		// to be honest I don't really know what mt means
		mt, message, err := c.ReadMessage()
		if err != nil {
			// client probably just disconnected (closed window)
			break
		}

		sin := string(message)
		flirtyRequestRegexp := regexp.MustCompile(FLIRTY_REQUEST_FORMAT)
		matches := flirtyRequestRegexp.FindAllStringSubmatch(sin, 1)
		if matches == nil {
			c.WriteMessage(mt /* wtf? */, []byte(fmt.Sprintf("Request %s not sufficiently flirty", sin)))
		}

		// still don't know what mt means
		err = c.WriteMessage(mt, []byte(fetchResource(matches[0][1])))
		if err != nil {
			fmt.Printf("Fer chrissakes even this can fail? %s", err)
		}
	}
}

func main() {
	mux := http.NewServeMux()

	assets := http.FileServer(http.Dir(FRONTEND_PATH))
	mux.Handle("/assets/", assets)

	mux.HandleFunc("/", indexHandler)

	mux.HandleFunc("/ws", websocketHandler)
	fmt.Println("Starting up!")
	http.ListenAndServe(":6474", mux)
	browser.OpenURL("http://localhost:6474")
}
