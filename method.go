package main

import (
	"fmt"
	"os"
	"os/user"
)

type tester interface {
	test()
	string() string
}

type data struct{}

func (*data) test()         {}
func (data) string() string { return "hello" }

func main() {
	var d data

	i, _ := user.Current()
	fmt.Println("the userName is :", i.Name)
	fmt.Println("the userName is :", i.Gid)
	fmt.Println("the userName is :", i.HomeDir)
	fmt.Println("the userName is :", i.Name)
	fmt.Println("the userName is :", i.Username)

	user := os.Getenv("USER")
	fmt.Println("*********the userName is :", user)
	var t tester = &d
	t.test()
	println(t.string())

}
