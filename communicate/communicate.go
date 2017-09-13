//Package communicate 主要用于http协议之间的数据通讯
//比如http 的GET POST DELETE PUT GET 操作
package communicate

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"strings"
)

//PUT restful请求PUT操作
const (
	PUT    = "PUT"
	POST   = "POST"
	GET    = "GET"
	DELETE = "DELETE"
)

const (
	applicationTypeJSON = "application/json"
	applicationTypeXML  = "application/xml"
)

const httpHeaderContentType string = "Content-Type"

const httpHeaderAccept string = "Accept"

func SendRequestByJSON(requestType string, serverURL string, content interface{}) ([]byte, error) {
	jsonTypeContent, _ := json.Marshal(content)
	body := strings.NewReader(string(jsonTypeContent))

	client := &http.Client{}

	req, _ := http.NewRequest(requestType, serverURL, body)
	req.Header.Set(httpHeaderContentType, applicationTypeJSON)
	req.Header.Set(httpHeaderAccept, applicationTypeJSON)

	resp, err := client.Do(req) //发送
	if err != nil {
		return []byte{}, err
	}
	defer resp.Body.Close() //一定要关闭resp.Body
	data, _ := ioutil.ReadAll(resp.Body)

	respBody := data

	return respBody, err
}
