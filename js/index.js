/*Melissa Louise Bangloy*/
document.addEventListener("DOMContentLoaded", function () {


    //form fields 
    let from_currency = document.getElementById("from_currency");
    let to_currency = document.getElementById("to_currency");
    let amount = document.getElementById("amount");

    //buttons 
    let convert = document.getElementById("convert");
    let show = document.getElementById("show");
    let clearHistory = document.getElementById("clear");
    

    //let endpoint = 'convert';
    // let access_key = '49ef384fdb7f2da92dd926f2ea93b7a3';

    //object 
    let urlObject = {
        mainURL: "http://api.exchangerate.host/convert?access_key=49ef384fdb7f2da92dd926f2ea93b7a3",
        // mainURL: "https://api.exchangerate.host/convert",
        fromQry:   from_currency.value,
        toQry:     to_currency.value,
        amountQry: amount.value, 
        absoluteURL: function( ){
            this.fromQry = from_currency.value;
            this.toQry = to_currency.value;
            this.amountQry = amount.value;

            //returns the query string required to retrieve info from the web API
            //https://api.exchangerate.host/convert?from=USD&to=CAD&amount=35 
            /*
            mainURL: "https://api.exchangerate.host/convert" + ?
            fromQry : from=USD + &
            toQry: to=CAD + & 
            amountQry: amount=35 
            */
            return this.mainURL+"?from="+this.fromQry+"&to="+this.toQry+"&amount="+this.amountQry ;
            // return this.mainURL+'?access_key=' + access_key + "?from="+this.fromQry+"&to="+this.toQry+"&amount="+this.amountQry ;
        }
    }
    //console.log(JSON.stringify(urlObject));
    

    //fetches the from and To currency options from the json file
    fromToCurrencyOptions();
    function fromToCurrencyOptions(){
        let jsonFile = "json/currency.json";
        fetch(jsonFile)
            .then(function(response){
                if(response.ok){
                    return response.json();
                }else{
                    return "error";
                }
            })
            .then(function(response){
                if (response != "error" ){
                    displayOptions(response); //function that will populate the option menu
                }else{
                    alert (`${response}: error`)
                }
            })
    }

    //this function populates the necessary option for from/to currency
    function displayOptions(response){
        /*
        "CAD": {
            "symbol": "CA$",
            "name": "Canadian Dollar",
            "symbol_native": "$",
            "decimal_digits": 2,
            "rounding": 0,
            "code": "CAD",
            "name_plural": "Canadian dollars"
	        },
        */
       let currency =  Object.keys(response);
      
        //console.log("Json currency option " + currency.length);
        let defaultFromOption = document.createElement("option");
        let defaultToOption =  document.createElement("option");
        let currency_name = ""; //textContent
        let currency_code = ""; //value

        for (let i=0; i< currency.length; i++){
            let key = currency[i];
            let currencyValue = Object.values(response)[i];

            if ( key == "CAD" ){
                currency_name = currencyValue.name;
                currency_code = currencyValue.code;
                break;
            }
        }

        //setting default value for From
        defaultFromOption.value = currency_code;
        defaultFromOption.textContent = currency_name;
        from_currency.appendChild(defaultFromOption);

        //console.log(currency_code);

        //setting default value for To
        defaultToOption.value = currency_code;
        defaultToOption.textContent = currency_name;
        to_currency.appendChild(defaultToOption);

        //adding the other currency as an option 
        for (let i=0; i< currency.length; i++){
            let key = currency[i];
            let currencyValue = Object.values(response)[i];

            if ( key != "CAD" ){
                let fromOption = document.createElement("option");
                let toOption = document.createElement("option");
                currency_name = currencyValue.name;
                currency_code = currencyValue.code;

                //from currency
                fromOption.value = currency_code;
                fromOption.textContent = currency_name;
                from_currency.appendChild(fromOption);

                //to currency
                toOption.value = currency_code;
                toOption.textContent = currency_name;
                to_currency.appendChild(toOption);
            }
        }
    } //end of displayOptions 


    //setting the values of the input/select once the fields are clicked and changed
    from_currency.onclick = function(){
        urlObject.fromQry = from_currency.value;
        console.log("from_currency " + from_currency.value);
    }
    to_currency.onclick = function(){
        urlObject.to_currency = to_currency.value;
        console.log("to_currency " + to_currency.value);
    }
    amount.onchange = function(){
        urlObject.amountQry = amount.value;
        if (urlObject.amountQry == null || urlObject.amountQry == undefined){
            urlObject.amountQry = 1;
        }
        console.log("amount " + amount.value);
    }


    //when the info was accessed
    let convertAccessedDate = ""; //stores the date when the result was accessed

    //getting today's date for tableDate
    function getLogDayTime(){
        let date = new Date();
        let todayDate = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
        let time = displayCheck(date.getHours()) + "-" +  displayCheck(date.getMinutes()) + "-" + displayCheck(date.getSeconds());

        let todayDateTime = todayDate + "__" + time;
        //this method checks the time. if the number is below 10, it will add 0 before the time/minute for readability
        function displayCheck(i){
            if (i < 10){
                i = "0" + i;
            }
            return i;
        }
        return todayDateTime;
    }; //getLogDayTime

    //When convert button is clicked 
    convert.addEventListener("click", function(){
        //fetching urlObject absoluteURL
        let link = urlObject.absoluteURL();
        console.log("link " + link);
        fetch( link )
            .then( function(response){
                if(response.ok){
                    return response.json();
                }else{
                    return "error";
                }
            })
            .then(function(response){
                if (response != "error"){
                    getResult(response); //function that will get the result
                }
                
                else{
                    alert(`${response}: Not available at the moment`);
                }
            })
        //console.log(urlObject.absoluteURL())
        convertAccessedDate =  getLogDayTime();
        //console.log(convertAccessedDate);

    }, false);

    //object for localStorage 
    let resultsObj = []; //array of object where the results are will be stored 
    let localStorageResult = JSON.parse(localStorage.getItem("resultsObj")); 
        if(localStorageResult == null || localStorageResult == undefined ){
            localStorage.setItem("resultsObj", JSON.stringify(resultsObj));
        }
    //console.log("FV" + JSON.stringify(resultsObj));


    //function that will get the result
    function getResult(response){
        // SAMPLE SEARCH RESULT
        /*
        {
        "from":         "BWP",
        "to":           "SGD","amount":500},
        "info":         {"rate":0.106398},
        "historical":   false,
        "date":            "2022-11-19",
        "result":       53.198977}
         */

        //object that stores the search result from fetching the result on the web api
        let resultFromFetch = {
            from: response.query.from, 
            to: response.query.to,
            rate: response.info.rate,
            amount: response.query.amount, 
            payment: response.result.toFixed(2),
            date: convertAccessedDate
        };
        //console.log(JSON.stringify(resultFromFetch));

        //adding the resultFromFetch to the localStorage
        resultsObj.push(resultFromFetch);
        //console.log("resultsObj " + JSON.stringify(resultsObj));
        displayResultToTable(resultsObj); //displays the result to the table
        //console.log("rsfg " + (Object.values(resultsObj[0])));
        if(localStorageResult.length > 0){
           // localStorageResult.push(resultFromFetch);

            localStorage.setItem("resultsObj", JSON.stringify(localStorageResult));
        }else{
            localStorage.setItem("resultsObj", JSON.stringify(resultsObj));
        }
        //console.log("localStorageResult " + JSON.stringify(localStorageResult[0]));
    }//getResult method

    //build the table with the fetched results
    let tbody = document.getElementsByTagName("tbody");
    function displayResultToTable(results){
        tbody[0].textContent = " ";
        for (let i = 0; i < results.length; i++){
            let tr = document.createElement("tr");

            let tdValue = Object.values(results[i]);
            //console.log(tdValue[0]);
            
            let fromTd = document.createElement("td");
            let toTd = document.createElement("td");
            let rateTd = document.createElement("td");
            let amountTd = document.createElement("td");
            let paymentTd = document.createElement("td");
            let dateTd = document.createElement("td");

            let fromTdContent = document.createTextNode(tdValue[0]);
            let toTdContent  = document.createTextNode(tdValue[1]);
            let rateTdContent  = document.createTextNode(tdValue[2]);
            let amountTdContent  = document.createTextNode(tdValue[3]);
            let paymentTdContent  = document.createTextNode(tdValue[4]);
            let dateTdContent  = document.createTextNode(tdValue[5]);

            fromTd.appendChild(fromTdContent);
            toTd.appendChild(toTdContent);
            rateTd.appendChild(rateTdContent);
            amountTd.appendChild(amountTdContent);
            paymentTd.appendChild(paymentTdContent);
            dateTd.appendChild(dateTdContent);

            tr.appendChild(fromTd);
            tr.appendChild(toTd);
            tr.appendChild(rateTd);
            tr.appendChild(amountTd);
            tr.appendChild(paymentTd);
            tr.appendChild(dateTd);
            tbody[0].appendChild(tr);
        }
    } //displayResultToTable

    //when show button is clicked
    show.onclick = function(){
        let localStorageResult = JSON.parse(localStorage.getItem("resultsObj")); 
        if(localStorageResult.length > 0 ){
            let message = confirm("Displaying conversion history");
            if( message === true){
                resultsObj = localStorageResult;
                displayResultToTable(resultsObj);
            }else{
                alert( "You did not confirm to show history");
            }
        }else{
            alert("No history to show");
        }
    }//show.onclick

    //when clear button is clicked
    let table = document.getElementById("table");
    clearHistory.onclick = function(){
        let localResult = JSON.parse(localStorage.getItem("resultsObj")); 
        
        if ( localResult.length > 0){
            let message = confirm(`Confirm to delete conversion history. There are currently ${localResult.length} history saved`);

            if( message === true){
                localStorage.clear();
                for(let i; i<resultsObj.length; i++){
                    resultsObj.pop();
                }
                let row = table.getElementsByTagName("tr");
                //removes all table rows
                for(let r = 1; r<row.length; r++){
                    table.removeChild(table.lastChild);
                }
                localResult = "";
            }else{
                alert( "You did not confirm to delete history");
            }
        }else{
            alert("Nothing to delete");
        }
    }//clearHistory.onclick

}, false);