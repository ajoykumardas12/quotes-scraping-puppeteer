import puppeteer, { Puppeteer } from "puppeteer";
import PromptSync from "prompt-sync";

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

                return {text, author};
            });
        });

        //display scraped data
        console.log("Quotes from page: " + pageNumber);
        pageNumber++;
        console.log(quotes);
    };

    const nextPagePrompt = () => {
        const prompt = PromptSync();

        //ask user if they want to scrape next page
        const response = prompt("Do you want to scrape the next page? \n Enter 'y' for yes \n Enter any other key to exit. \n");

        if(response === "y"){
            //click on the 'next' (page) button
            page.click(".pager > .next > a");
            getQuotes();
            // nextPagePrompt();
        }else{
            //close the browser
            browser.close();
        }
    }

    // get page data
    async function run() {
        await getQuotes();
        nextPagePrompt();
    }
    run();
    
};

// start the scraping
scrapeQuotes();