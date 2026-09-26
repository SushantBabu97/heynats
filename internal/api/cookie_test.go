package api

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestSetSessionCookie(t *testing.T) {
	gin.SetMode(gin.TestMode)
	cases := []struct {
		name       string
		proto      string
		wantSecure bool
	}{
		{"plain http", "", false},
		{"behind https proxy", "https", true},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)
			c.Request = httptest.NewRequest(http.MethodPost, "/api/nats/connect", nil)
			if tc.proto != "" {
				c.Request.Header.Set("X-Forwarded-Proto", tc.proto)
			}

			setSessionCookie(c, "abc", 3600)

			resp := w.Result()
			cookies := resp.Cookies()
			if len(cookies) != 1 {
				t.Fatalf("got %d cookies, want 1", len(cookies))
			}
			ck := cookies[0]
			if ck.Name != ConnectionIDKey || ck.Value != "abc" || !ck.HttpOnly {
				t.Errorf("unexpected cookie %+v", ck)
			}
			if ck.SameSite != http.SameSiteLaxMode {
				t.Errorf("SameSite = %v, want Lax", ck.SameSite)
			}
			if ck.Secure != tc.wantSecure {
				t.Errorf("Secure = %v, want %v", ck.Secure, tc.wantSecure)
			}
		})
	}
}
