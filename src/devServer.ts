import express from "express";
import wertik from "./main";

let app = express();

wertik(app, {
    dialect: "mysql",
    name: "Wertik",
    builtinModules: "user,auth",
    db_username: "root",
    db_password: "",
    db_name: "graphql",
    db_host: "localhost",
    db_port: "3306",
});