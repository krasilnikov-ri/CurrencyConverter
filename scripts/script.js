var goods = [
    { name: 'Товар 1', price: 20 },
    { name: 'Товар 2', price: 45 },
    { name: 'Товар 3', price: 67 },
    { name: 'Товар 4', price: 1305 }
];
var selectedGoods = [];
document.addEventListener('DOMContentLoaded', function () {
    var cartElem = document.getElementById('cart');
    initItems(selectedGoods, cartElem);
    var goodsList = document.getElementById('goods');
    initItems(goods, goodsList);
    var goodsListItems = goodsList.getElementsByTagName('li');
    for (var i = 0; i < goodsListItems.length; ++i) {
        var button = createButton('Добавить в корзину', addItemToCart, [goods[i], cartElem]);
        goodsListItems[i].appendChild(button);
    }
    showTotalPrice(document.getElementById('totalPrice'), null);
    document.getElementById('getTotalCart').addEventListener('click', recalcTotalCart);
});
var addItemToCart = function (item, cart) {
    selectedGoods.push(item);
    initItems(selectedGoods, cart);
};
var initItems = function (data, target) {
    if (data.length === 0) {
        target.innerHTML = 'Пусто';
        return;
    }
    target.innerHTML = null;
    data.forEach(function (item) {
        var htmlItem = document.createElement('li');
        htmlItem.innerHTML = item.name + " | \u0426\u0435\u043D\u0430: $" + item.price;
        target.appendChild(htmlItem);
    });
};
var recalcTotalCart = function () {
    var req = getXmlHttp();
    req.open('GET', apiEndpoint + "?access_key=" + apiAccessKey + "&currencies=" + сurrencies.join(','), true);
    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    req.onreadystatechange = function () {
        if (req.readyState == 4) {
            if (req.status == 200) {
                var rates = JSON.parse(req.responseText).quotes;
                showTotalPrice(document.getElementById('totalPrice'), rates);
            }
        }
    };
    req.send(null);
};
var showTotalPrice = function (target, rates) {
    var totalPrice = getTotalPrice(rates);
    var totalPriceList = [
        ['₽', totalPrice.rubles.toFixed(2), '(Russian Ruble)'].join(' '),
        ['€', totalPrice.euros.toFixed(2), '(Euro)'].join(' '),
        ['$', totalPrice.US_dollars.toFixed(2), '(United States Dollar)'].join(' '),
        ['£', totalPrice.pounds.toFixed(2), '(British Pound Sterling)'].join(' '),
        ['¥', totalPrice.yens.toFixed(2), '(Japanese Yen)'].join(' ')
    ];
    setTotalPriceList(totalPriceList, target);
};
var getTotalPrice = function (rates) {
    var totalPriceUSD = selectedGoods.map(function (item) { return item.price; }).reduce(function (acc, cur) { return acc + cur; }, 0);
    return selectedGoods.length > 0 ? {
        US_dollars: totalPriceUSD,
        euros: totalPriceUSD * rates.USDEUR,
        pounds: totalPriceUSD * rates.USDGBP,
        rubles: totalPriceUSD * rates.USDRUB,
        yens: totalPriceUSD * rates.USDJPY
    } : {
        US_dollars: 0,
        euros: 0,
        pounds: 0,
        rubles: 0,
        yens: 0
    };
};
var setTotalPriceList = function (data, target) {
    target.innerHTML = null;
    data.forEach(function (item) {
        var priceListItem = document.createElement('li');
        priceListItem.innerHTML = item;
        target.appendChild(priceListItem);
    });
};
var apiEndpoint = 'http://www.apilayer.net/api/live';
var apiAccessKey = 'f4105131c918c909b8c7932503eabced';
var сurrencies = [
    'USD',
    'RUB',
    'EUR',
    'GBP',
    'JPY'
];
var getXmlHttp = function () {
    var xmlhttp;
    try {
        xmlhttp = new ActiveXObject('Msxml2.XMLHTTP');
    }
    catch (e) {
        try {
            xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
        }
        catch (E) {
            xmlhttp = false;
        }
    }
    if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
        xmlhttp = new XMLHttpRequest();
    }
    return xmlhttp;
};
var createButton = function (innerHtml, clickHandler, args) {
    var button = document.createElement('button');
    button.innerHTML = innerHtml;
    button.addEventListener('click', function () { return clickHandler.apply(null, args); });
    return button;
};
