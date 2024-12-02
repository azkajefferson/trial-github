package main

import (
    "database/sql"
    "encoding/json"
    "fmt"
    "log"
    "net/http"

    _ "github.com/lib/pq"
    "github.com/gorilla/mux"
)

var db *sql.DB

type Patient struct {
    ID       int    `json:"id"`
    Username string `json:"username"`
    Password string `json:"password"`
}

func initDB() {
    var err error
    connStr := "user=yourusername dbname=yourdbname sslmode=disable" // Update with your DB credentials
    db, err = sql.Open("postgres", connStr)
    if err != nil {
        log.Fatal(err)
    }
}

func registerPatient(w http.ResponseWriter, r *http.Request) {
    var patient Patient
    err := json.NewDecoder(r.Body).Decode(&patient)
    if err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    // Insert patient into the database
    _, err = db.Exec("INSERT INTO patients (username, password) VALUES ($1, $2)", patient.Username, patient.Password)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(patient)
}

func main() {
    initDB()
    defer db.Close()

    r := mux.NewRouter()
    r.HandleFunc("/api/patients", registerPatient).Methods("POST")

    fmt.Println("Server is running on port 8080")
    log.Fatal(http.ListenAndServe(":8080", r))
}