//node automation.js --source="https://www.hackerrank.com" --config=config.json
let minimist=require("minimist");
let fs=require("fs");
let jsdom=require("jsdom");
let args=minimist(process.argv);

let json=fs.readFileSync(args.config,"utf-8");
let config=JSON.parse(json);

//console.log(config);
let puppeteer = require("puppeteer");
const { PageEmbeddingMismatchedContextError } = require("pdf-lib");

//  (async () => {
//    let browser = await puppeteer.launch({headless:false});
//    let page = await browser.newPage();''
//    await page.goto(args.source);
//    await page.screenshot({ path: 'example.png' });

//    await browser.close();
//  })();


async function run(){
//below launch function opens browser
  let browser = await puppeteer.launch({   //we are trying to open browser here,launch gives promise so we use await
    headless:false,                       //headless:true would hide from user to see the browser opening and task happening
    args:[
          '--start-maximized'           //to open browser in full screen
    ],
    defaultViewport:null
   });   
   //get a tab
   let page = await browser.newPage();    //page array is promised by browser.newPage(),newpage make a new tab for pages on browser
   //go to url
   await page.goto(args.source);

   await page.waitForSelector("a[data-event-action='Login']");//attribute so we used []
   await page.click("a[data-event-action='Login']");  //everything in " " is an attribute
   //delay(3000);

  await page.waitForSelector("a[href='https://www.hackerrank.com/login']");  //attribute so we used []
  await page.click("a[href='https://www.hackerrank.com/login']");

  await page.waitForSelector("input[aria-describedby='tooltip-input-1']");
  await page.type("input[aria-describedby='tooltip-input-1']",config.userid);

  await page.waitForSelector("input[aria-describedby='tooltip-input-2']");
  await page.type("input[aria-describedby='tooltip-input-2']",config.password);

  await page.waitForSelector("button[data-analytics='LoginPassword']");  
  await page.click("button[data-analytics='LoginPassword']");

  await page.waitForSelector("a[href='/contests']");  
  await page.click("a[href='/contests']");

  await page.waitForSelector("a[href='/administration/contests/']");  //attribute so we used []
  await page.click("a[href='/administration/contests/']");

  //find total pages 
  await page.waitForSelector("a[data-attr1='Last']");     
  let numpages=await page.$eval("a[data-attr1='Last']",function(lastTag){    //$eval runs queryselectorAll on the given attribute and stores its tags(<a > tag in this case) in lastTag(in the form of array)
   let numpages=lastTag.getAttribute("data-page");   //data-page attribute has total number of pages ,getAttribute returns attribute's value
   return parseInt(numpages);
  });

 //console.log(numpages);

 for(let i=0;i<numpages-1;i++)
 {
  // await page.waitForSelector("a[data-attr1='Right']");  
  // await page.click("a[data-attr1='Right']");
  await handlepage(browser,page);

 }

 
 
 async function handlepage(browser,page){
  
  //work for 1 page
 await page.waitForSelector("a.backbone.block-center");  //waitForSelector() is used for each page
 let ourls=await page.$$eval("a.backbone.block-center",function(atags){  //$$eval vs $eval
 
  // let urls=[];
  // for(let i=0;i<atags.length;i++)
  // {
  //   let link=atags[i].getAttribute("href")
  //   urls.push(link);
  // }

  let urls=atags.map(function(link){
   return link.getAttribute("href");
  });
  return urls;
 });

 //console.log(ourls);
 for(let i=0;i<ourls.length;i++)
 {

  await handlecontest(browser,page,ourls[i]);
 }
 //move to next page
  await page.waitForSelector("a[data-attr1='Right']");  
  await page.click("a[data-attr1='Right']");

}

async function handlecontest(browser,page,curl){

  let npage=await browser.newPage();
  await npage.goto(args.source+curl);

    // await npage.waitForSelector("button.save-contest.btn.btn-green");  
    // await npage.click("button.save-contest.btn.btn-green");

   await npage.waitFor(2000);
  
   await npage.waitForSelector("li[data-tab='moderators']");  
   await npage.click("li[data-tab='moderators']");

    await npage.waitForSelector("input.wide.ui-autocomplete-input");  
    await npage.click("input.wide.ui-autocomplete-input");

   await npage.waitForSelector("input.wide.ui-autocomplete-input");
   await npage.type("input.wide.ui-autocomplete-input",config.moderators);

    await npage.waitForSelector("button.btn.moderator-save");  
    await npage.click("button.btn.moderator-save");
  
  await npage.waitFor(2000);
  await npage.close();
  await page.waitFor(2000);
}

}

run();