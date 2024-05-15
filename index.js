import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "admin",
  port: 5432,
});

db.connect();

let allcountries = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  //Write your code here.
  try{
    const result = await db.query("SELECT country_code FROM visited_countries");

    if(result.rowCount > 0)
    {
      let countries = [];
      result.rows.forEach((country) => {
        countries.push(country.country_code);
      });
      allcountries = countries;
      res.render("index.ejs", {countries: allcountries, total: result.rowCount});
      console.log(allcountries);
    }
    else{
      console.log("Not thing");
    }
  }
  catch(err){
    console.error("Error executing query", err.stack);
  }
});



app.post("/add", async (req, res) => {
  const country = req.body.country;
  try{
    const result = await db.query("SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';", [country.toLowerCase()]);
    const data = result.rows[0];
    const countryCode = data.country_code;
    try{
      await db.query("INSERT INTO visited_countries(country_code) VALUES($1)", [countryCode]);
      res.redirect("/");
    }catch (err) {
      console.log("Error executing query", err);
      res.render("index.ejs", {error: "Country has already been added, try again.", 
                              countries: allcountries, 
                              total: allcountries.length});
    }
  }catch (err) {
    console.log("Error executing query", err);
    res.render("index.ejs", {error: "Country does not exit, try again.", 
                            countries: allcountries, 
                            total: allcountries.length});
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
