// / <reference path="jquery-3.6.0.js"/>
'use strict';

$(function () { //Document ready


    function resetSearch() {
        $(".alert").hide();
        $(".card").show();
    }

    $("#mySearchBtn").on("click", function (e) {
        e.preventDefault();
        let value = $("#mySearchInput").val().toLowerCase();
        $("#mySearchInput").val("")
        $(".card").filter(function () {
            $(this).toggle($(this).find(".card-title").text().toLowerCase() == value);
        });
        $("#noSearchResultsAlert").remove();
        if ($(".card[style$='display: none;']").length == 100) {
            $("#homeContent").append(`
            <div class="alert alert-warning" role="alert" id="noSearchResultsAlert">
                No search results found!
            </div>`
            );
        }

    });

    $("li a").each(function () {
        $(this).click(function (e) {
            e.preventDefault();
            const url = $(this).attr("href");
            ajax1(url);
        });;
    });


    const ajax1 = (url, firstLoad) => {
        $.ajax({
            type: "get",
            url: url,
            data: "string",
            dataType: "html",
            success: function (response) {
                if (firstLoad == true) {
                    $("#content").append(response);
                    if (url === "home.html") {
                        getCoinsData()
                    } else if (url == "about.html") {
                        $("#aboutContent").hide();
                    } else {
                        $("#liveReportsContent").hide();
                        resetSearch();
                    }
                }
                else {
                    $(".container").hide();
                    if (url === "home.html") {
                        $("#homeContent").show();
                        $(".form-inline.my-2.my-lg-0").show();

                        resetSearch();
                    } else if (url === "liveReports.html") {
                        $("#liveReportsContent").show();
                        $(".form-inline.my-2.my-lg-0").hide();
                        liveReportFunction();
                    } else {
                        $("#aboutContent").show();
                        $(".form-inline.my-2.my-lg-0").hide();
                    }

                }

            },
            error: err => alert(err)

        });
    }

    ajax1("home.html", true);
    ajax1("liveReports.html", true);
    ajax1("about.html", true);




    const homeSpinner = `<div class="spinner-grow text-light" role="status" id="homeSpinner">
    <span class="sr-only">Loading...</span>
    </div>`


    function getCoinsData() {
        $("#homeContent").html(homeSpinner)
        setTimeout(() => {
            $.ajax({
                type: "get",
                url: "https://api.coingecko.com/api/v3/coins/list",
                data: "string",
                dataType: "json",
                success: function (response) {
                    cardsCreation(response);
                },
                error: err => alert(err)
            });
        }, 1500);
    }

    function getCoinMoreData(id, href) {
        $.ajax({
            type: "get",
            url: "https://api.coingecko.com/api/v3/coins/" + id,
            data: "string",
            dataType: "json",
            success: function (response) {
                moreInfoCreation(response, href, id);
            },
            error: err => alert(err)

        });
    }

    $(document).on('click', ".moreInfo", function () {
        const time = new Date();
        const id = $(this).parent().find(".card-id").html();
        const href = $(this).attr("href")
        const moreInfoJson = localStorage.getItem('moreInfo' + id)
        if (moreInfoJson != undefined) {
            const moreInfo = JSON.parse(moreInfoJson);
            if (time.getTime() - moreInfo.date <= 120000) { //less than (or equal to) 2 minutes
                $(href + " .card-body").html(moreInfo.html);
                return;
            }
        }
        //get data from API
        getCoinMoreData(id, href);
    });

    function moreInfoCreation(moreInfo, href, id) {
        let photo = moreInfo.image.thumb
        let usd = moreInfo.market_data.current_price.usd
        let eur = moreInfo.market_data.current_price.eur
        let ils = moreInfo.market_data.current_price.ils
        const TamplateMoreInfo = `
        <p><img src="${photo}"></p>
        <p>Currency Prices:</p>
        <p>USD: $ ${usd}</p>
        <p>EUR: € ${eur}</p>
        <p>ILS:  ₪ ${ils}</p>
        `;
        const time = new Date();
        const moreInfoData = { "html": TamplateMoreInfo, "date": time.getTime() };
        localStorage.setItem("moreInfo" + id, JSON.stringify(moreInfoData));
        $(href + " .card-body").html(TamplateMoreInfo)
    }

    function cardsCreation(coins) {
        let cards = ""
        let i = 0

        for (const coin of coins) {
            let card =
                `
            <div class="card" style="width: 18rem;">
            <div class="card-body">
            
            <div class="custom-control custom-switch myCard">
            <input type="checkbox" class="custom-control-input" id="${i}">
            <label class="custom-control-label" for="${i}"></label>
            </div>
          


            <p hidden class="card-id">${coin.id}</p>
            <h5 class="card-title">${coin.symbol}</h5>
            <p class="card-text">${coin.name}</p>
            <a class="btn btn-primary moreInfo" data-toggle="collapse" href="#multiCollapse${i}" role="button" aria-expanded="false" aria-controls="multiCollapse">More Info</a>
            <div class="collapse multi-collapse" id="multiCollapse${i}">
            <div class="card-body">
            <div class="spinner-grow" role="status"><span class="sr-only">Loading...</span></div>      
            </div>
            </div>
            </div>
            </div>
            `
            cards += card
            i++

            if (i === 100) break;
        }


        $("#homeContent").html(cards);


        $('#homeContent div.myCard input.custom-control-input').on('click', function (e) {
            const numberOfChecked = $('#homeContent input:checkbox:checked').length;
            if (typeof ($(this).attr("checked")) == "undefined" && numberOfChecked > 5) {
                e.preventDefault();
                popupModal($(this).attr("id"));
            }
        });
    }

    function popupModal(lastIdtoActivate) {
        let cards = ""
        $("#myModal").modal('show');
        let activatedCards = $("#homeContent div.myCard input.custom-control-input:checked")
        // console.log(activatedCards.length);
        for (const activeCard of activatedCards) {
            const id = $(activeCard).attr("id");
            if (id === lastIdtoActivate) {
                continue;
            };
            let card = `
            <div class="cardModalDiv">
            <p>${$(activeCard).parent().parent().find(".card-title").html()}</p>
            <p><div class="custom-control custom-switch myCard">
            <input type="checkbox" name="popUpName" class="custom-control-input" id="popUp${id}" checked>
            <label class="custom-control-label" for="popUp${id}"></label>
            </div></p>
            </div>
            `
            cards += card
        }

        $(".modal-body").html(cards);

        $('#myModal').on('click', "div.myCard input.custom-control-input", function (e) {
            $('#myModal div.myCard input.custom-control-input').prop('checked', true);
            $(this).prop('checked', false);
        });


        $('#myModal').on('click', ".saveBtnModal", function (e) {

            const disableID = $("#myModal input:not(:checked)").attr("id");
            if (typeof (disableID) != "undefined") {
                $("#" + disableID.substring(5)).prop('checked', false);
                $("#" + lastIdtoActivate).prop('checked', true);
            }
            else {
                console.log("modal saved without any button unchecked");
            }

            $('#myModal').modal("hide");
        });

    }

    ////////////////////////////////////////
    //Functions for live reports >>
    ////////////////////////////////////////
    let timeoutID = 0;
    let dataArray = [];
    /* function addDataToChart(coins){
         for (const symbol in coins) {
             const coinPrice = coins[symbol].USD;
 
         }
     }*/
    function demo(coins) {
        let coinsArray = coins.split(",");
        let response = {};
        for (const coin of coinsArray) {
            response[coin] = { "USD": Math.random() * 10000 };
        }
        setTimeout(() => addDataToChart(response, coins), 1000);

    }
    //{"coin": {"USD": 4.00}}, {"coin2": {"USD": 4.00}}}
    function liveReportApi(coins) {
        $.ajax({
            type: "get",
            url: `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${coins}&tsyms=USD`,
            data: "string",
            dataType: "json",
            success: function (response) {
                addDataToChart(response, coins)
                $("#homeSpinner").remove();
            },
            error: err => alert(err)
        });
    };

    let dataPoints = [];
    let newDataCount = 0;
    let timer = 0;
    function addDataToChart(data, coins) {
        let i = 0;
        $.each(data, function (key, value) {
            dataArray[i].dataPoints.push({ x: timer, y: parseInt(value.USD) });
            i++;
            //xValue++;
            //yValue = parseInt(value[1]);
        });

        newDataCount = 1;
        timer += 2;

        $("#chartContainer").CanvasJSChart().render(); //מעדכן נתונים של הגרף לפי דאטה פוינטס
        timeoutID = setTimeout(() => liveReportApi(coins), 2000);
        // timeoutID = setTimeout(() => demo(coins), 2000);
    }




    function liveReportFunction() {
        if (typeof (timeoutID) != undefined) {
            clearTimeout(timeoutID);
        };

        newDataCount = 0;
        timer = 0;
        $("#liveReportsContent").append(homeSpinner);

        dataArray = [];
        let names = "";
        $('#homeContent input:checkbox:checked').each((index, element) => {
            //console.log($(this));
            const name = $(element).parent().parent().find(".card-title").html();
            names += name + ",";
            const obj = { type: "spline", showInLegend: true, name: name, xValueFormatString: "SS", yValueFormatString: "$#,##0" }
            obj.dataPoints = [];
            dataArray.push(obj);
        });

        if ($('#homeContent input:checkbox:checked').length == 0) {
            $("#liveReportsContent .alert").show();
            $("#homeSpinner").remove();
            return;
        }
        // demo(names.substring(0, names.length - 1))
        liveReportApi(names.substring(0, names.length - 1));

        // data: [{
        //     type: "spline",
        //     name: "Units Sold",
        //     showInLegend: true,
        //     xValueFormatString: "MMM YYYY",
        //     yValueFormatString: "#,##0 Units",
        //     dataPoints: [
        //         { x: new Date(2016, 0, 1),  y: 120 
        var options = {
            exportEnabled: true,
            animationEnabled: true,
            title: {
                text: "Activeted coins chart"
            },
            subtitles: [{
                text: "Click Legend to Hide or Unhide Data Series"
            }],
            axisX: {
                title: "Seconds"
            },
            axisY: {
                title: "Coins Price",
                titleFontColor: "#4F81BC",
                lineColor: "#4F81BC",
                labelFontColor: "#4F81BC",
                tickColor: "#4F81BC"
            },
            axisY2: {
                title: "Profit in USD",
                titleFontColor: "#C0504E",
                lineColor: "#C0504E",
                labelFontColor: "#C0504E",
                tickColor: "#C0504E"
            },
            toolTip: {
                shared: true
            },
            legend: {
                cursor: "pointer",
                itemclick: toggleDataSeries
            },
            data: dataArray,
            /*data: [{
                type: "spline",
                name: "Price",
                showInLegend: true,
                xValueFormatString: "SS",
                yValueFormatString: "$#,##0",
                dataPoints: dataPoints,
            }]*/
        }
        $("#chartContainer").CanvasJSChart(options);

        function toggleDataSeries(e) {
            if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                e.dataSeries.visible = false;
            } else {
                e.dataSeries.visible = true;
            }
            e.chart.render();
        }

    }













});

