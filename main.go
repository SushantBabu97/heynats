package main

import (
	"embed"
	"io/fs"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/astergaze-solutions/heynats/internal/api"
	"github.com/astergaze-solutions/heynats/internal/infrastructure"
)

//go:embed all:client/dist
var clientDist embed.FS

func main() {
	dist, err := fs.Sub(clientDist, "client/dist")
	if err != nil {
		log.Fatal(err)
	}
	router := infrastructure.NewRouter(dist)
	natsConnections := api.NewNatsConnection()
	middleware := api.NewConnectionMiddleware(natsConnections)

	apiGroup := router.Group("/api")

	// Register APIs
	healthAPI := api.NewHealth(apiGroup)
	healthAPI.RegisterRoutes()

	natsAPIGroup := apiGroup.Group("/nats")
	natsAPI := api.NewHeyNats(natsAPIGroup, natsConnections, middleware)
	natsAPI.RegisterRoutes()

	kvAPI := api.NewKVAPI(natsAPIGroup, natsConnections, middleware)
	kvAPI.RegisterRoutes()

	streamAPI := api.NewStreamAPI(natsAPIGroup, natsConnections, middleware)
	streamAPI.RegisterRoutes()

	publishAPI := api.NewPublishAPI(natsAPIGroup, natsConnections, middleware)
	publishAPI.RegisterRoutes()

	subscribeAPI := api.NewSubscribeAPI(natsAPIGroup, natsConnections, middleware)
	subscribeAPI.RegisterRoutes()

	// Setup graceful shutdown
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)

	go func() {
		<-c
		log.Println("Shutting down gracefully...")
		natsConnections.Shutdown()
		os.Exit(0)
	}()

	// Start and run the server
	log.Println("Starting server on :5000")
	router.Run(":5000")
}
