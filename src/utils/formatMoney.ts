export function formatMoney(amount: number, decimalCount = 2, decimal = ",", thousands = ".") {
    let amount1 = amount
    if (amount < 0) {
        amount1 = - amount
    }
    try {
        decimalCount = Math.abs(decimalCount);
        decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

        const negativeSign = amount1 < 0 ? "-" : "";
        const newAmount = String(parseInt(Math.abs(Number(amount1) || 0).toFixed(decimalCount)));

        let i = newAmount;
        let j = (i.length > 3) ? i.length % 3 : 0;

        if (amount < 0) {
            return " - " + negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount1 - parseInt(i)).toFixed(decimalCount).slice(2) : "");
        } else {
            return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount1 - parseInt(i)).toFixed(decimalCount).slice(2) : "");
        }

    } catch (e) {
        console.log(e)
    }
};
