const goods: IProduct[] = [
    { name: 'Товар 1', price: 20 },
    { name: 'Товар 2', price: 45 },
    { name: 'Товар 3', price: 67 },
    { name: 'Товар 4', price: 1305 }
];

/**
 * Goods need to be added to the cart manually:
 * You can collect the basket, which is described in the specifications
 */
const selectedGoods: IProduct[] = [];

document.addEventListener(
    'DOMContentLoaded',
    () => {
        const cartElem = document.getElementById('cart');
        initItems(selectedGoods, cartElem);

        const goodsListElem = document.getElementById('goods');
        initItems(goods, goodsListElem);

        const goodsListItems = goodsListElem.getElementsByTagName('li');
        for (let i = 0; i < goodsListItems.length; ++i) {
            const button = createButton('Добавить в корзину', addItemToCart, [goods[i], cartElem]);
            goodsListItems[i].appendChild(button);
        }

        showTotalPrice(document.getElementById('totalPrice'), null);

        document.getElementById('getTotalCart').addEventListener(
            'click',
            recalcTotalCart
        );
    }
);

const addItemToCart = (item: IProduct, cart: HTMLElement) => {
    selectedGoods.push(item);
    initItems(selectedGoods, cart);
}

const initItems = (data, target: HTMLElement): void => {
    if (data.length === 0) {
        target.innerHTML = 'Пусто';
        return;
    }
    target.innerHTML = null;
    data.forEach(item => {
        const htmlItem = document.createElement('li');
        htmlItem.innerHTML = `${item.name} | Цена: $${item.price}`;
        target.appendChild(htmlItem);
    });
}

const recalcTotalCart = (): void => {
    const req = getXmlHttp();
    req.open(
        'GET',
        `${apiEndpoint}?access_key=${apiAccessKey}&currencies=${сurrencies.join(',')}`,
        true
    );
    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    req.onreadystatechange = () => {
        if (req.readyState == 4) {
            if (req.status == 200) {
                const rates = JSON.parse(req.responseText).quotes; // current exchange rates
                showTotalPrice(document.getElementById('totalPrice'), rates);
            }
        }
    };
    req.send(null);
}

const showTotalPrice = (target: HTMLElement, rates: IApiCurrencies): void => {
    const totalPrice = getTotalPrice(rates);

    const totalPriceList = [
        ['₽', totalPrice.rubles.toFixed(2), '(Russian Ruble)'].join(' '),
        ['€', totalPrice.euros.toFixed(2), '(Euro)'].join(' '),
        ['$', totalPrice.US_dollars.toFixed(2), '(United States Dollar)'].join(' '),
        ['£', totalPrice.pounds.toFixed(2), '(British Pound Sterling)'].join(' '),
        ['¥', totalPrice.yens.toFixed(2), '(Japanese Yen)'].join(' ')
    ];

    setTotalPriceList(totalPriceList, target);
}

const getTotalPrice = (rates: IApiCurrencies): ITotalCart => {
    /**
     let totalPriceUSD = 0;
     selectedCart.forEach(item => {
         totalPriceUSD += item.price;
     });
     */
    const totalPriceUSD = selectedGoods.map(item => item.price).reduce((acc, cur) => acc + cur, 0);

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
        }
}

const setTotalPriceList = (data: string[], target: HTMLElement): void => {
    target.innerHTML = null;
    data.forEach(item => {
        const priceListItem = document.createElement('li');
        priceListItem.innerHTML = item;
        target.appendChild(priceListItem);
    });
}

interface ITotalCart {
    US_dollars: number;
    rubles: number;
    euros: number;
    pounds: number;
    yens: number;
}

interface IApiCurrencies {
    USDUSD: number;
    USDRUB: number;
    USDEUR: number;
    USDGBP: number;
    USDJPY: number;
}

interface IProduct {
    name: string,
    price: number;
}

/*interface ICartItem extends IProduct {
    id: number;
}*/

const apiEndpoint = 'http://www.apilayer.net/api/live';
const apiAccessKey = 'f4105131c918c909b8c7932503eabced';
const сurrencies = [
    /**
     * 'USD' in request brings extra load on API-server because it's the base currency and always == 1
     * but I have whole 1000 requests per month for free, and hope this is enough for debug and check this task :)
     */
    'USD', // United States Dollar    
    'RUB', // Russian Ruble
    'EUR', // Euro
    'GBP', // British Pound Sterling
    'JPY' // Japanese Yen
]

/**
 * Returns crossbrowser XMLHttpRequest object
 */
const getXmlHttp = () => {
    let xmlhttp;
    try {
        xmlhttp = new ActiveXObject('Msxml2.XMLHTTP');
    } catch (e) {
        try {
            xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
        } catch (E) {
            xmlhttp = false;
        }
    }
    if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
        xmlhttp = new XMLHttpRequest();
    }
    return xmlhttp;
}

const createButton = (innerHtml, clickHandler, args) => {
    const button = document.createElement('button');
    button.innerHTML = innerHtml;
    button.addEventListener('click', () => clickHandler.apply(null, args));
    return button;
}