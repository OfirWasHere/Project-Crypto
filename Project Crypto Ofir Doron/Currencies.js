/// <reference path="jquery-3.6.1.js" />

"use strict";


$(() => {

    // =========================================================== page loading animation ====================================================

    // on window load/refresh play spinner so the page has time to load properly (can be disabled if not loading large amount of data from api)
    $(window).on('load', loadingAnimation)
    function loadingAnimation() {
        $('body').append('<div id="loadingDiv"><div class="loader"></div></div>');
        setTimeout(() => {
            $("#loadingDiv").fadeOut(600, function () {
                // fadeOut complete. Remove the loading div
                const loadingDiv = document.querySelectorAll("#loadingDiv");
                loadingDiv.forEach(item => {
                    item.remove()
                })
            });
        }, 600);
    }

    // ============================================================ Fetch and Storage  ========================================================

    // if Coins from api is null or undefined get new set of coins from API
    fetchData()
    function fetchData() {
        if (localStorage.getItem("CoinsFromAPI") === null || localStorage.getItem("CoinsFromAPI") === undefined) {
            fetch("https://api.coingecko.com/api/v3/coins").then(res => res.json()).then(data => {
                localStorage.setItem("CoinsFromAPI", JSON.stringify(data))
                displayCoins(data)
                console.log("fetch")
                createButtons();
            })
        } else {
            displayCoins(JSON.parse(localStorage.getItem("CoinsFromAPI")))
            console.log("not Fetch")
            createButtons();
        }
    }

    // Updating every 2 minutes the api coins if user is idle 
    // // if 2 minutes has passed since last API request,(more info button/page refresh or just idling for 2 minutes) data will be requested again from api, else it will be taken from local storage
    let myTimer = setInterval(refreshLocalStorage, 120000);

    $(".buttonDesign").on("click", function () {
        clearInterval(myTimer);
        myTimer = setInterval(refreshLocalStorage, 120000);
    })

    function refreshLocalStorage() {
        fetch("https://api.coingecko.com/api/v3/coins").then(res => res.json()).then(data => {
            localStorage.setItem("CoinsFromAPI", JSON.stringify(data));
            console.log("Updated coins")
        })
    }

    // Creating User Selected Keys in storage
    if (localStorage.getItem("localSelectedKeys") === null) {
        localStorage.setItem("localSelectedKeys", JSON.stringify([]));
    }

    // Updating user Selected keys in storage
    function updateUserSelectedKeys(data) {
        localStorage.setItem("localSelectedKeys", JSON.stringify(data))
    }

    // Get user Selected keys from localStorage
    function getUserSelectedKeys() {
        if (localStorage.getItem("localSelectedKeys") === null || localStorage.getItem("localSelectedKeys") === undefined) {
            return fetchDataFromAPI()
        }
        return JSON.parse(localStorage.getItem("localSelectedKeys"));
    }
    // =========================================================== Currencies button functionality ================================================================ 

    $("#currencies").on("click", () => {
        fetchData();
        updatedSelectedCoins();
        loadingAnimation();

        // removing active class/adding to selected page
        $("#currencies").addClass("active");
        $("#liveReports").removeClass("active");
        $("#about").removeClass("active");
    })

    // =========================================================== Displaying Coins ================================================================ 

    // Displaying Coins: 
    function displayCoins(data) {
        let html = ""
        for (const item of data) {
            html += `
                <div class="coinBox">
                    <div class="title">${item.symbol}
                        <label class="switch">
                        <input type="checkbox" name="coinCheckBox" value="${item.symbol}">
                        <span class="slider round"></span>
                    </label>
                    </div>
                        <div class="coinName">${item.name}</div>
                        <button class="buttonDesign">More Info</button>
                    <div class="collapsibleInfoBox">
                    <img src="${item.image.small}">
                    <div>
                        ${item.market_data.current_price.usd}$
                        <br>
                        ${item.market_data.current_price.eur}€
                        <br>
                        ${item.market_data.current_price.ils}₪
                        </div>
                    </div>
                </div>`
        }
        $(".mainContent").html(html);
    }

    // adding Functionality to the "More Info" button

    function createButtons() {
        $(".buttonDesign").on("click", function () {

            $(this).next(".collapsibleInfoBox").fadeToggle()

            // Increasing height/Decreasing after button click
            if ($(this).parent('.coinBox').css("height") === "125px") {
                $(this).parent('.coinBox').css({
                    "height": "225px",
                    'transition-duration': '0.5s'
                })
            } else {
                $(this).parent('.coinBox').css({
                    "height": "125px",
                    'transition-duration': '0.5s'
                })
            }

            // Change text inside button
            $(this).text() === "More Info" ? $(this).text("Close") : $(this).text("More Info")

            // delayed button so user cant spam click
            $(this).prop('disabled', true);
            setTimeout(function () {
                $(".buttonDesign").prop('disabled', false);
            }, 500);
        })
    }

    // adding functionality to Search-Input on the navbar
    $("#searchInput").on("keyup", function () {
        let value = $(this).val().toLowerCase();
        console.log("Key pressed: " + value)
        //filters coins based on user input
        $(".coinBox").filter(function () {
            $(this).toggle($(this).children(".title, .coinName").text().toLowerCase().indexOf(value) > -1)
        })
    })

    // Select/Check-box of the coins functionality:

    $(".mainContent").on("input", function () {
        // adding checked coins to array
        const selectedCoinsArr = [];

        // Get last clicked element (for cancel button)
        let lastCheckedCheckbox = event.target.value;

        $(this).children('div').find(":checkbox[name='coinCheckBox']:checked").each(function () {
            selectedCoinsArr.push($(this).val());
            // console.log($(this).val())
            updateUserSelectedKeys(selectedCoinsArr)
        })

        // if more than 5 are selected Modal will pop-out
        const checked = $(".mainContent").find('input[type=checkbox]:checked').length;
        if (checked >= 6) {
            openModal(selectedCoinsArr, lastCheckedCheckbox);
        }

        // validating if both "localSelectedKey" is the same as the "selectedCoinsArr" else it will be overwritten
        if (selectedCoinsArr.length === 0) {
            if (getUserSelectedKeys() !== selectedCoinsArr) {
                updateUserSelectedKeys(selectedCoinsArr)
            }
        }
    })

    // ============================================== Modal (popup) ===================================================================

    function openModal(selectedCoinsArr, lastCheckedCheckbox) {
        // appending the modal container to the header element so it overlap the main-content div
        $("header")
            .append('<div class="modal-container"></div>')

        $(".modal-container")
            .append(`<div class="modal-boxOfContent"></div>`)

        // displaying the modal on the user screen
        let html = `<div id="modal-title">Too many crypto coins selected, please remove at least one<div/>`

        for (const item of selectedCoinsArr) {
            html += `    
                        <div class="coinBox-modal">
                            <div class="modal-Coin-Title">${item}</div>
                            <label class="switch">
                            <input type="checkbox" checked="checked" name="coinCheckBoxVerify" value="${item}">
                            <span class="slider round"></span>
                            </label>
                        </div>`
        }
        html += `<div><button class="buttonDesign" id="cancelButton">Cancel</button><button class="buttonDesign" id="modalSaveButton">Save changes</button><div>`
        $(".modal-boxOfContent").html(html);

        // ================================== Cancel Modal Button =============================

        $("#cancelButton").on("click", function () {
            // console.log(lastCheckedCheckbox)
            $(".mainContent").children('div').find(`input:checkbox[value='${lastCheckedCheckbox}']`).prop('checked', false);

            // update User Selected Keys
            selectedCoinsArr.splice(selectedCoinsArr.indexOf(lastCheckedCheckbox), 1)

            // only works if user tried something dodgy and selected more than 5 coins (refreshed the page for example)
            // cancel will remove only the latest added coins
            if (selectedCoinsArr.length >= 6) {
                for (let i = selectedCoinsArr.length; i >= 6; i--) {
                    let removedCoin = selectedCoinsArr.pop()
                    $(".mainContent").children('div').find(`input:checkbox[value='${removedCoin}']`).prop('checked', false);
                }
            }

            updateUserSelectedKeys(selectedCoinsArr)

            // removing modal from screen
            $(".modal-container").fadeOut(500, function () {
                $(".modal-container").remove();
            })
        })

        // ============================== Save Changes Modal Button =============================

        // Saving changes of modal after user submit
        $("#modalSaveButton").on("click", function () {
            const savedCoinsNew = new Array;

            $("input:checkbox[name=coinCheckBoxVerify]:checked").each(function () {
                savedCoinsNew.push($(this).val());
            });

            // if you still haven't reduced to 5 coins and tried to save just highlighting the text
            if (savedCoinsNew.length > 5) {
                $("#modal-title").css("color", "yellow");
            } else {

                // Updating localSelectedKeys
                updateUserSelectedKeys(savedCoinsNew)

                // Saving temperately the boxes that the user has unchecked
                const uncheckedCoins = new Array;
                $("input:checkbox[name=coinCheckBoxVerify]:not(:checked)").each(function () {
                    uncheckedCoins.push($(this).val());
                });

                // Unchecking boxes that the user has unchecked
                for (const item of uncheckedCoins) {
                    $(".mainContent").children('div').find(`input:checkbox[value='${item}']`).prop('checked', false);
                }

                // updating user screen with the selected coins
                for (const item of savedCoinsNew) {
                    $(".mainContent").children('div').find(`input:checkbox[value='${item}']`).prop('checked', true);
                }

                // Removing Modal completely from user screen
                $(".modal-container").fadeOut(500, function () {
                    $(".modal-container").remove();
                })
            }
        })
    }

    // On PageUp/Refresh update Selected coins 
    updatedSelectedCoins()
    function updatedSelectedCoins() {
        const keys = getUserSelectedKeys()
        // console.log(keys)

        for (const item of keys) {
            $(".mainContent").children('div').find(`input:checkbox[value='${item}']`).prop('checked', true);
        }
    }

    // Remove Selection of coins button on navbar
    $("#clearSelectionButton").on("click", () => {
        const keys = getUserSelectedKeys()
        for (const item of keys) {
            $(".mainContent").children('div').find(`input:checkbox[value='${item}']`).prop('checked', false);
            localStorage.setItem("localSelectedKeys", JSON.stringify([]));
        }
    })

    // in extreme case if user has managed to select more than 5 coins and wanted to go to Live reports page, it will remove the latest added coins
    function RemoveTooManyCoins() {
        let selectedCoinsArr = getUserSelectedKeys()
        if (selectedCoinsArr.length > 5) {
            for (let i = selectedCoinsArr.length; i > 5; i--) {
                selectedCoinsArr.pop()
            }
        }
        updateUserSelectedKeys(selectedCoinsArr)
    }

    //================================================================== live reports page ==========================================================================:

    $("#liveReports").on("click", function () {
        $(this).addClass("active");
        $("#currencies").removeClass("active");
        $("#about").removeClass("active");
        $('#chartContainer').html("");
        loadingAnimation()
        RemoveTooManyCoins()
        startGraphData()

        function startGraphData() {
            // Getting the user selected coins from the localStorage
            const coins = getUserSelectedKeys()

            if (coins.length <= 0) {
                $(".mainContent").html("<h1>No coins are Selected, Please select at least one...</h1>")
            } else {
                $(".mainContent").html("")

                // Stopping chart from continuing onces a different page has been loaded:
                $("#currencies").on("click", () => {
                    clearInterval(myInterval);
                })
                $("#about").on("click", () => {
                    clearInterval(myInterval);
                })
                $("#liveReports").on("click", () => {
                    clearInterval(myInterval);
                })

                // Converting all keys to uppercase
                const localSelectedKey = getUserSelectedKeys()
                const upperCaseKey = localSelectedKey.map(element => {
                    return element.toUpperCase();
                });

                let dataPoints = []
                for (let i = 0; i < localSelectedKey.length; i++) {
                    dataPoints.push([])
                }

                const myInterval = setInterval(async () => {
                    let time = new Date;
                    $.get(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${localSelectedKey[0]},${localSelectedKey[1]},${localSelectedKey[2]},${localSelectedKey[3]},${localSelectedKey[4]}&tsyms=USD,&api_key=0cdab74df84d6c180cf1efbb7697bd38d7f9d78f005c026fdd87199804857e26`, (data) => {
                        // Pushing new aquired data from api to the chart
                        for (let i = 0; i < localSelectedKey.length; i++) {
                            dataPoints[i].push({
                                x: time.getTime(),
                                y: data[upperCaseKey[i]].USD
                            });
                        }
                    })
                    console.log("ajax call")
                    showGraph(upperCaseKey, dataPoints)
                }, 2000);
            }
        }


        function showGraph(upperCaseKey, dataPoints) {
            var chart = new CanvasJS.Chart("chartContainer", {

                title: {
                    text: "Real-time Price in $"
                },
                axisX: {
                    title: "chart updates every 3 secs"
                },
                axisY: {
                    title: "Crypto Price USD",
                    titleFontColor: "#000E46",
                    lineColor: "#000E46",
                    labelFontColor: "#000E46",
                    tickColor: "#000E46",
                    prefix: "$",
                    includeZero: false
                },
                toolTip: {
                    shared: true
                },
                legend: {
                    cursor: "pointer",
                    verticalAlign: "top",
                    fontSize: 30,
                    fontColor: "dimGrey",
                    backgroundColor: "#F5E7D5",
                    itemclick: toggleDataSeries
                },

                // Data displaying on the chart
                data:
                    [{
                        type: "line",
                        xValueType: "dateTime",
                        yValueFormatString: "###.00$",
                        xValueFormatString: "HH:mm:ss",
                        showInLegend: true,
                        name: upperCaseKey[0],
                        dataPoints: dataPoints[0]
                    },
                    {
                        type: "line",
                        xValueType: "dateTime",
                        yValueFormatString: "###.00$",
                        xValueFormatString: "HH:mm:ss",
                        showInLegend: true,
                        name: upperCaseKey[1],
                        dataPoints: dataPoints[1]
                    },
                    {
                        type: "line",
                        xValueType: "dateTime",
                        yValueFormatString: "###.00$",
                        xValueFormatString: "HH:mm:ss",
                        showInLegend: true,
                        name: upperCaseKey[2],
                        dataPoints: dataPoints[2]
                    },
                    {
                        type: "line",
                        xValueType: "dateTime",
                        yValueFormatString: "###.00$",
                        xValueFormatString: "HH:mm:ss",
                        showInLegend: true,
                        name: upperCaseKey[3],
                        dataPoints: dataPoints[3]
                    },
                    {
                        type: "line",
                        xValueType: "dateTime",
                        yValueFormatString: "###.00$",
                        xValueFormatString: "HH:mm:ss",
                        showInLegend: true,
                        name: upperCaseKey[4],
                        dataPoints: dataPoints[4]
                    },
                    ]
            });

            const newChart = chart.render();
            $("#chartContainer").html(newChart)

            function toggleDataSeries(e) {
                if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                    e.dataSeries.visible = false;
                }
                else {
                    e.dataSeries.visible = true;
                }
                e.chart.render();
            }
            chart.render();


            // Destroying chart if user selected a different page:
            $("#currencies").on("click", () => {
                chart.destroy()
            })

            $("#liveReports").on("click", () => {
                chart.destroy()
            })

            $("#about").on("click", () => {
                chart.destroy()
            })
        }
    })

    // //===================================================================== about page ==============================================================================:
    $("#about").on("click", function () {
        // Changing active class navbar for selected page and disabling current page button
        $(this).addClass("active")
        $("#currencies").removeClass("active")
        $("#liveReports").removeClass("active")

        loadingAnimation()
        let aboutMeHtml = `<div class="AboutMePar">
        <p class="aboutMeTitle" >Heyya! My name is Ofir Doron!</p>
        <p class="aboutMePar">I am currently a student at John Bryce learning to become a Full Stack Developer,<br>
          I am a passionate person loving to write code and use my creativity throughout :3
          <br><br>
          <a href="https://www.linkedin.com/in/ofir-doron-aa9728238/" target="_blank"><img src="Assets/images/linkedin.png" id="linksIMG"><a> 
          <a href="https://github.com/OfirWasHere" target="_blank"><img src="Assets/images/github.png" id="linksIMG"><a> 
        </p>
      </div>
      <img class="aboutMeImage" src="/Assets/images/my image.jpg" alt="My Image">
      `

        $(".mainContent").html(aboutMeHtml)
    })
});

