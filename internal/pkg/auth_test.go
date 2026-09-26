package pkg

import (
	"testing"

	"github.com/nats-io/nkeys"
)

func TestAuthOption(t *testing.T) {
	kp, _ := nkeys.CreateUser()
	seed, _ := kp.Seed()
	creds := "-----BEGIN NATS USER JWT-----\neyJhbGciOi.fake.jwt\n------END NATS USER JWT------\n\n" +
		"-----BEGIN USER NKEY SEED-----\n" + string(seed) + "\n------END USER NKEY SEED------\n"

	for name, c := range map[string]NATSCredential{
		"none":  {},
		"user":  {Username: "a", Password: "b"},
		"token": {Token: "t"},
		"nkey":  {NKeySeed: string(seed) + "\n"},
		"creds": {Creds: creds},
	} {
		opt, err := c.authOption()
		if err != nil || (name != "none") != (opt != nil) {
			t.Errorf("%s: opt=%v err=%v", name, opt != nil, err)
		}
	}
	if _, err := (&NATSCredential{NKeySeed: "bogus"}).authOption(); err == nil {
		t.Error("bad seed accepted")
	}
}
