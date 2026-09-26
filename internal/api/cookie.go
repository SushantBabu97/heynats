package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// setSessionCookie writes (maxAge > 0) or clears (maxAge < 0) the connection cookie.
// SameSite=Lax keeps browsers from sending it on cross-site POST/DELETE requests.
// Secure is set when the request arrived over HTTPS, directly or via a reverse proxy
// such as Caddy, so plain http://localhost keeps working in development.
func setSessionCookie(c *gin.Context, value string, maxAge int) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(ConnectionIDKey, value, maxAge, "/", "", isHTTPS(c.Request), true)
}

func isHTTPS(r *http.Request) bool {
	return r.TLS != nil || r.Header.Get("X-Forwarded-Proto") == "https"
}
