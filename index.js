import puppeteer, { Puppeteer } from "puppeteer";
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let pageNumber = 1;

const scrapeQuotes = async () => {
    // start a Puppeteer session
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });

    // open a new page
    const page = await browser.newPage();

    // on new page, open "http://quotes.toscrape.com/"
    // wait until the dom content is loaded
    await page.goto("http://quotes.toscrape.com/", {
        waitUntil: "domcontentloaded",
    });

    // use 'quotes()' get page data
    const getQuotes = async() => { 
        const quotes = await page.evaluate(() => {
            // fetch all elements with class 'quote'
            const quoteList = document.querySelectorAll(".quote");

            // convert quoteList to an iterable array
            // for each quote fetch the text and author
            return Array.from(quoteList).map((quote) => {
                //fetch the sub elements of quote
                const text = quote.querySelector(".text").innerText;
                const author = quote.querySelector(".author").innerText;
                const tagsList = quote.querySelectorAll(".tags .tag");

                const tags =  [];
                Array.from(tagsList).map((tag) => {
                    const currentTag = tag.innerText;
                    tags.push(currentTag);
                })
                return {text, author, tags};
            });
        });

        //display scraped data
        console.log("Quotes from page: " + pageNumber);
        pageNumber++;
        console.log(quotes);
    };

    async function nextPagePrompt() {
        // ask user if they want to scrape next page
        rl.question("Do you want to scrape the next page? \n Enter 'y' for yes \n Enter any other key to exit. \n", async (response) => {
          if (response === "y") {
            // check if next button exists
            const nextButton = await page.$(".pager > .next > a");
            if (nextButton) {
                // click on the 'next' (page) button
                await Promise.all([
                page.waitForNavigation({ waitUntil: "networkidle0" }),
                page.click(".pager > .next > a"),
                ]);
                await getQuotes();
                await nextPagePrompt();
            }
            else{
                //no more pages
                console.log("No more pages to scrape");
                // close the readline interface and browser
                rl.close();
                browser.close();
            }
          } else {
            // close the readline interface and browser
            rl.close();
            browser.close();
          }

        });
    };

    // get page data
    async function run() {
        await getQuotes();
        nextPagePrompt();
    }
    run();
};

// start the scraping
scrapeQuotes();