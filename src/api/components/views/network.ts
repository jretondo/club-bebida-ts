import { Router, NextFunction, Response, Request } from 'express';
import { sendPass } from '../../../utils/sendEmails/sendPass';
import Names from '../../../utils/data/Names.json';
import Colors from '../../../utils/data/Colors.json';
import Links from '../../../utils/data/Links.json';
import { IEmailSendPass } from '../../../interfaces/IEmails';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import utf8 from 'utf8';
import base64 from 'base-64';
import { Error } from 'tinify/lib/tinify/Error';
import moment from 'moment';
import { file } from '../../../network/response';
import ejs from 'ejs';
import pdf from 'html-pdf';
import JsReport from 'jsreport';
import { promisify } from 'util';

const router = Router();

const newUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const data: any = await sendPass(
        "jretondo",
        "aeaega",
        "jretondo90@gmail.com",
        "Nuevo usurio",
        true,
        true);

    let url: string;
    if (process.env.ENTORNO === "PROD") {
        url = "http://nekoadmin.com.ar:3016/images/logo.jpg"
    } else {
        url = "http://localhost:3017/images/logo.jpg"
    }

    const datos: IEmailSendPass = {
        Colors,
        Links,
        Names,
        titlePage: "Recuperar Contraseña",
        titleHead: "Hola Retondo Javier",
        parrafosHead: [`Usted es nuevo usuario del sistema de Administración de ${Names[0].productName}`],
        titleButton: "A continuación le pasamos los datos de ingreso al mismo:",
        textCall: "Usuario: jretondo",
        textCall2: "Contraseña: zdbzdbzdbzd",
        textFoother: `Útilice esta información para poder ingresar al sistema: <br> <a href='${Links[0].linkApp}' target='_blank'>Aplicación de Administración</a>`
    }

    try {
        res.render(data, datos);
    } catch (error) {
        next(error)
    }
}

const newFact = (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const factData = {
        "ver": 1,
        "fecha": moment(new Date).format("YYYYNNDD"),
        "cuit": 20185999336,
        "ptoVta": 3,
        "tipoCmp": 11,
        "nroCmp": 5,
        "importe": 50,
        "moneda": "PES",
        "ctz": 0,
        "tipoDocRec": 96,
        "nroDocRec": 35092514,
        "tipoCodAut": "E",
        "codAut": "72052985659262"
    }

    function base64_encode(file: any) {
        // read binary data
        var bitmap: Buffer = fs.readFileSync(file);
        // convert binary data to base64 encoded string
        return Buffer.from(bitmap).toString('base64');
    }

    const factDataStr = JSON.stringify(factData)
    var text = factDataStr
    var bytes = utf8.encode(text);
    var encoded = base64.encode(bytes);
    const paraAfip = "https://www.afip.gob.ar/fe/qr/?p=" + encoded
    let logo64 = base64_encode(path.join("public", "images", "invoices", "logo.png"))
    let lAfip1 = base64_encode(path.join("public", "images", "invoices", "AFIP1.png"))
    let lAfip2 = base64_encode(path.join("public", "images", "invoices", "AFIP2.png"))

    QRCode.toDataURL(paraAfip, function (err, url) {
        if (err) {
            throw new Error("Algo salio mal")
        }
        const myCss = fs.readFileSync(path.join("public", "css", "style.css"), 'utf8')

        const encabezado = {
            factNro: "00002" + "-" + "00000025",
            fechaFact: "25/01/2022",
            letra: "B",
            codFact: "06",
        }
        const ptoVta = {
            razSocOrigen: "DROP SRL",
            direccionOrigen: "Obispo Trejo 902, Córdoba",
            condIvaOrigen: "IVA Responsable Incripto",
            emailOrigen: "elclubdelalimpieza@gmail.com",
            cuitOrigen: "30715515322",
            iibbOrigen: "285918880",
            iniAct: "04/10/2016",
        }
        const cliente = {
            clienteDireccion: "Av Emilio Olmos 324, Córdoba",
            clienteEmail: "jretondo90@gmail.com",
            clienteName: "Retondo Javier",
            clienteNro: 35092514,
        }
        const totales = {
            subTotal: "500,25",
            totalIva: "50,00",
            totalFact: "1.550,25",
            totalDesc: "300,00"
        }
        const formaPago = {
            formaPago: "CUENTA CORRIENTE",
            tipoDoc: "CUIT",
            condIvaCliente: "IVA RES. INSCRIPTO",
            saldoCtaCte: "$ 52.652,69" || false,
        }
        const listaItems = [
            {
                alicuota_id: 21,
                nombre_prod: "Prod 1 hdhdf dhd hdfh df hdfhdfh dfhdfh dfh",
                precio_ind: "520,52",
                cant_prod: 5,
                total_prod: "520,52",
                unidad_tipo_prod: 1
            },
            {
                alicuota_id: 21,
                nombre_prod: "Prod 1 hdhdf dhd hdfh df hdfhdfh dfhdfh dfh",
                precio_ind: "520,52",
                cant_prod: 5,
                total_prod: "520,52",
                unidad_tipo_prod: 2
            },
            {
                alicuota_id: 21,
                nombre_prod: "Prod 1 hdhdf dhd hdfh df hdfhdfh dfhdfh dfh",
                precio_ind: "520,52",
                cant_prod: 5,
                total_prod: "520,52",
                unidad_tipo_prod: 0
            }
        ]

        const cbteAsoc = false || "B 00002-00000025"

        const foother = {
            logo: 'data:image/png;base64,' + logo64,
            logoAfip1: 'data:image/png;base64,' + lAfip1,
            logoAfip2: 'data:image/png;base64,' + lAfip2,
            codQR: url,
            caeNro: 72052985659262,
            caeVto: "25/01/2022",
            vendedor: "Alfredo Retondo"
        }

        const datos2 = {
            myCss: `<style>${myCss}</style>`,
            listaItems,
            cbteAsoc,
            ...encabezado,
            ...ptoVta,
            ...cliente,
            ...totales,
            ...formaPago,
            ...foother,
        }
        const fiscal = false
        if (fiscal) {
            res.render('invoices/Factura.ejs', datos2);
        } else {
            res.render('invoices/FacturaNoFiscal.ejs', datos2);
        }

    })
}
const newNotaCred = (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const factData = {
        "ver": 1,
        "fecha": moment(new Date).format("YYYYNNDD"),
        "cuit": 20185999336,
        "ptoVta": 3,
        "tipoCmp": 8,
        "nroCmp": 5,
        "importe": 50,
        "moneda": "PES",
        "ctz": 0,
        "tipoDocRec": 96,
        "nroDocRec": 35092514,
        "tipoCodAut": "E",
        "codAut": "72052985659262"
    }

    function base64_encode(file: any) {
        // read binary data
        var bitmap: Buffer = fs.readFileSync(file);
        // convert binary data to base64 encoded string
        return Buffer.from(bitmap).toString('base64');
    }

    const factDataStr = JSON.stringify(factData)
    var text = factDataStr
    var bytes = utf8.encode(text);
    var encoded = base64.encode(bytes);
    const paraAfip = "https://www.afip.gob.ar/fe/qr/?p=" + encoded
    let logo64 = base64_encode(path.join("public", "images", "invoices", "logo.png"))
    let lAfip1 = base64_encode(path.join("public", "images", "invoices", "AFIP1.png"))
    let lAfip2 = base64_encode(path.join("public", "images", "invoices", "AFIP2.png"))

    QRCode.toDataURL(paraAfip, function (err, url) {
        if (err) {
            throw new Error("Algo salio mal")
        }
        const myCss = fs.readFileSync(path.join("public", "css", "style.css"), 'utf8')

        const encabezado = {
            factNro: "00002" + "-" + "00000025",
            fechaFact: "25/02/2022",
            letra: "NC B",
            codFact: "08",
        }
        const ptoVta = {
            razSocOrigen: "DROP SRL",
            direccionOrigen: "Obispo Trejo 902, Córdoba",
            condIvaOrigen: "IVA Responsable Incripto",
            emailOrigen: "elclubdelalimpieza@gmail.com",
            cuitOrigen: "30715515322",
            iibbOrigen: "285918880",
            iniAct: "04/10/2016",
        }
        const cliente = {
            clienteDireccion: "Av Emilio Olmos 324, Córdoba",
            clienteEmail: "jretondo90@gmail.com",
            clienteName: "Retondo Javier",
            clienteNro: 35092514,
        }
        const totales = {
            subTotal: "500,25",
            totalIva: "50,00",
            totalFact: "1.550,25",
            totalDesc: "300,00"
        }
        const formaPago = {
            formaPago: "CUENTA CORRIENTE",
            tipoDoc: "CUIT",
            condIvaCliente: "IVA RES. INSCRIPTO",
            saldoCtaCte: "$ 52.652,69" || false,
        }
        const listaItems = [
            {
                alicuota_id: 21,
                nombre_prod: "Prod 1 hdhdf dhd hdfh df hdfhdfh dfhdfh dfh",
                precio_ind: "520,52",
                cant_prod: 5,
                total_prod: "520,52",
                unidad_tipo_prod: 1
            },
            {
                alicuota_id: 21,
                nombre_prod: "Prod 1 hdhdf dhd hdfh df hdfhdfh dfhdfh dfh",
                precio_ind: "520,52",
                cant_prod: 5,
                total_prod: "520,52",
                unidad_tipo_prod: 2
            },
            {
                alicuota_id: 21,
                nombre_prod: "Prod 1 hdhdf dhd hdfh df hdfhdfh dfhdfh dfh",
                precio_ind: "520,52",
                cant_prod: 5,
                total_prod: "520,52",
                unidad_tipo_prod: 0
            }
        ]

        const cbteAsoc = "B 00002-00000025"

        const foother = {
            logo: 'data:image/png;base64,' + logo64,
            logoAfip1: 'data:image/png;base64,' + lAfip1,
            logoAfip2: 'data:image/png;base64,' + lAfip2,
            codQR: url,
            caeNro: 72052985659262,
            caeVto: "25/01/2022",
            vendedor: "Alfredo Retondo"
        }

        const datos2 = {
            myCss: `<style>${myCss}</style>`,
            listaItems,
            cbteAsoc,
            ...encabezado,
            ...ptoVta,
            ...cliente,
            ...totales,
            ...formaPago,
            ...foother,
        }
        const fiscal = true
        if (fiscal) {
            res.render('invoices/Factura.ejs', datos2);
        } else {
            res.render('invoices/FacturaNoFiscal.ejs', datos2);
        }

    })
}

const downloadFact = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const factData = {
        "ver": 1,
        "fecha": moment(new Date).format("YYYYNNDD"),
        "cuit": 20185999336,
        "ptoVta": 3,
        "tipoCmp": 11,
        "nroCmp": 5,
        "importe": 50,
        "moneda": "PES",
        "ctz": 0,
        "tipoDocRec": 96,
        "nroDocRec": 35092514,
        "tipoCodAut": "E",
        "codAut": "72052985659262"
    }

    function base64_encode(file: any) {
        // read binary data
        var bitmap: Buffer = fs.readFileSync(file);
        // convert binary data to base64 encoded string
        return Buffer.from(bitmap).toString('base64');
    }

    const factDataStr = JSON.stringify(factData)
    var text = factDataStr
    var bytes = utf8.encode(text);
    var encoded = base64.encode(bytes);
    const paraAfip = "https://www.afip.gob.ar/fe/qr/?p=" + encoded
    let logo64 = base64_encode(path.join("public", "images", "invoices", "logo.png"))
    let lAfip1 = base64_encode(path.join("public", "images", "invoices", "AFIP1.png"))
    let lAfip2 = base64_encode(path.join("public", "images", "invoices", "AFIP2.png"))

    QRCode.toDataURL(paraAfip, function (err, url) {
        if (err) {
            throw new Error("Algo salio mal")
        }
        const myCss = fs.readFileSync(path.join("public", "css", "style.css"), 'utf8')

        const encabezado = {
            factNro: "00002" + "-" + "00000025",
            fechaFact: "25/01/2022",
            letra: "B",
            codFact: "06",
        }
        const ptoVta = {
            razSocOrigen: "DROP SRL",
            direccionOrigen: "Obispo Trejo 902, Córdoba",
            condIvaOrigen: "IVA Responsable Incripto",
            emailOrigen: "elclubdelalimpieza@gmail.com",
            cuitOrigen: "30715515322",
            iibbOrigen: "285918880",
            iniAct: "04/10/2016",
        }
        const cliente = {
            clienteDireccion: "Av Emilio Olmos 324, Córdoba",
            clienteEmail: "jretondo90@gmail.com",
            clienteName: "Retondo Javier",
            clienteNro: 35092514,
        }
        const totales = {
            subTotal: "500,25",
            totalIva: "50,00",
            totalFact: "1.550,25",
        }
        const formaPago = {
            formaPago: "CUENTA CORRIENTE",
            tipoDoc: "CUIT",
            condIvaCliente: "IVA RES. INSCRIPTO",
            saldoCtaCte: "$ 52.652,69",
            totalDesc: "300,00"
        }
        const listaItems = [
            {
                alicuota_id: 21,
                nombre_prod: "Prod 1 hdhdf dhd hdfh df hdfhdfh dfhdfh dfh",
                precio_ind: "520,52",
                cant_prod: 5,
                total_prod: "520,52",
                unidad_tipo_prod: 1
            },
            {
                alicuota_id: 21,
                nombre_prod: "Prod 1 hdhdf dhd hdfh df hdfhdfh dfhdfh dfh",
                precio_ind: "520,52",
                cant_prod: 5,
                total_prod: "520,52",
                unidad_tipo_prod: 2
            },
            {
                alicuota_id: 21,
                nombre_prod: "Prod 1 hdhdf dhd hdfh df hdfhdfh dfhdfh dfh",
                precio_ind: "520,52",
                cant_prod: 5,
                total_prod: "520,52",
                unidad_tipo_prod: 0
            }
        ]

        //"B 00002-00000025"
        const cbteAsoc = false

        const foother = {
            logo: 'data:image/png;base64,' + logo64,
            logoAfip1: 'data:image/png;base64,' + lAfip1,
            logoAfip2: 'data:image/png;base64,' + lAfip2,
            codQR: url,
            caeNro: 72052985659262,
            caeVto: "25/01/2022",
            vendedor: "Alfredo Retondo"
        }

        const datos2 = {
            myCss: `<style>${myCss}</style>`,
            listaItems,
            cbteAsoc,
            ...encabezado,
            ...ptoVta,
            ...cliente,
            ...totales,
            ...formaPago,
            ...foother,
        }

        ejs.renderFile(path.join("views", "invoices", "Factura.ejs"), datos2, (err, data) => {
            if (err) {
                console.log('err', err);
                throw new Error("Algo salio mal")
            }
            let options = {
                "height": "16.5in",        // allowed units: mm, cm, in, px
                "width": "12in",            // 
                "border": {
                    "right": "0.5cm",
                    "left": "0.5cm"
                },
            };

            pdf.create(data, options).toFile(path.join("public", "invoices", "B" + " " + "00005" + "-" + "00000025" + ".pdf"), async function (err, data) {
                if (err) {
                    console.log('err', err);
                    throw new Error("Algo salio mal")
                }
                file(req, res, path.join("public", "invoices", "B" + " " + "00005" + "-" + "00000025" + ".pdf"), 'application/pdf', "Factura B 00005-00000025.pdf")
            });
        })
    })
}

const vistaEmailFact = (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    let asunto
    const facturaName = "alfuna"
    const notaCredito = false
    const nombre = "Retondo Javier"
    const tdoc = "CUIT"
    const ndoc = 20350925148
    const email = "jretondo90@gmail.com"



    const attachment = {
        filename: facturaName,
        path: path.join('Public', 'Facturas', facturaName)
    }
    let informationList
    let parrafosHead
    let datos2


    if (notaCredito) {
        asunto = "Compra anulada - Nota de Crédito"
        informationList = [
            {
                col1: 6,
                title1: "Nombre completo",
                content1: nombre,
                col2: 6,
                title2: tdoc,
                content2: ndoc
            },
            {
                col1: 12,
                title1: "Email",
                content1: email,
                col2: 6
            },
            {
                col1: 12,
                title1: "Aclaraciones",
                content1: "La factura que precede a la presente ha sido anulado a través de una nota de crédito. La misma se encuentrra adjunta al presente email."
            }
        ]
        parrafosHead = [
            "En el presente email le adjuntamos la nota de crédito de la cancelación de la compra."
        ]

        datos2 = {
            Colors,
            Links,
            Names,
            //Particular
            //Head
            titlePage: "Confirmar Email",
            titleHead: "Hola " + nombre,
            parrafosHead: parrafosHead,

            //InfoForm
            titleInfoForm: "Sus Datos",
            informationList: informationList
        }

    } else {
        asunto = "Factura de compra realizada"
        informationList = [
            {
                col1: 6,
                title1: "Nombre completo",
                content1: nombre,
                col2: 6,
                title2: "Total",
                content2: "$ 33.050,52"
            },
            {
                col1: 6,
                title1: tdoc,
                content1: ndoc,
                col2: 6,
                title2: "Forma de Pago",
                content2: "Efectivo"
            },
            {
                col1: 12,
                title1: "Email",
                content1: email,
            }
        ]


        parrafosHead = [
            "En el presente email le adjuntamos la factura de su compra."
        ]

        datos2 = {
            Colors,
            Links,
            Names,
            //Particular
            //Head
            titlePage: "Confirmar Email",
            titleHead: "Hola " + nombre,
            parrafosHead: parrafosHead,

            //InfoForm
            titleInfoForm: "Sus Datos de envío",
            informationList: informationList
        }
    }
    res.render('emails/Templates/FactEmail.ejs', datos2);
}

const listadoCajaView = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    function base64_encode(file: any) {
        // read binary data
        var bitmap: Buffer = fs.readFileSync(file);
        // convert binary data to base64 encoded string
        return Buffer.from(bitmap).toString('base64');
    }

    const estilo = fs.readFileSync(path.join("views", "reports", "cajaList", "styles.css"), 'utf8')
    const logo = base64_encode(path.join("public", "images", "invoices", "logo.png"))

    const datos = {
        logo: 'data:image/png;base64,' + logo,
        style: "<style>" + estilo + "</style>",
        ptoVtaStr: "(P.V.: 3) OBISPO TREJO 902 - BARRIO : NUEVA CORDOBA",
        usuarioStr: "Javier Retondo (jretondo)",
        desdeStr: "25/01/2022",
        hastaStr: "20/02/2022",
        totaleslista: [
            {
                tipoStr: "Efectivo",
                totalStr: "2.520,36"
            },
            {
                tipoStr: "Débito",
                totalStr: "25.520,36"
            }
        ],
        listaVtas: [
            {
                fecha: "20/05/2022",
                cliente: "Retondo Javier (CUIT: 20350925148)",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Retondo Javier (CUIT: 20350925148)",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Retondo Javier (CUIT: 20350925148)",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            }
        ]
    }
    res.render('reports/cajaList/index.ejs', datos);
}

const cajaListPDF = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    function base64_encode(file: any) {
        // read binary data
        var bitmap: Buffer = fs.readFileSync(file);
        // convert binary data to base64 encoded string
        return Buffer.from(bitmap).toString('base64');
    }

    const estilo = fs.readFileSync(path.join("views", "reports", "cajaList", "styles.css"), 'utf8')
    const logo = base64_encode(path.join("public", "images", "invoices", "logo.png"))

    const datos = {
        logo: 'data:image/png;base64,' + logo,
        style: "<style>" + estilo + "</style>",
        ptoVtaStr: "(P.V.: 3) OBISPO TREJO 902 - BARRIO : NUEVA CORDOBA",
        usuarioStr: "Javier Retondo (jretondo)",
        desdeStr: "25/01/2022",
        hastaStr: "20/02/2022",
        totaleslista: [
            {
                tipoStr: "Efectivo",
                totalStr: "2.520,36"
            },
            {
                tipoStr: "Débito",
                totalStr: "25.520,36"
            }
        ],
        listaVtas: [
            {
                fecha: "20/05/2022",
                cliente: "Retondo Javier (CUIT: 20350925148)",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Consumidor Final",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Retondo Javier (CUIT: 20350925148)",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Retondo Javier (CUIT: 20350925148)",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Consumidor Final",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Retondo Javier (CUIT: 20350925148)",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Retondo Javier (CUIT: 20350925148)",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Consumidor Final",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Retondo Javier (CUIT: 20350925148)",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Retondo Javier (CUIT: 20350925148)",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Consumidor Final",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Retondo Javier (CUIT: 20350925148)",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Retondo Javier (CUIT: 20350925148)",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Consumidor Final",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Retondo Javier (CUIT: 20350925148)",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Retondo Javier (CUIT: 20350925148)",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Consumidor Final",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Retondo Javier (CUIT: 20350925148)",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Retondo Javier (CUIT: 20350925148)",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Consumidor Final",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Retondo Javier (CUIT: 20350925148)",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Retondo Javier (CUIT: 20350925148)",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Consumidor Final",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Retondo Javier (CUIT: 20350925148)",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Retondo Javier (CUIT: 20350925148)",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Consumidor Final",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Retondo Javier (CUIT: 20350925148)",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Retondo Javier (CUIT: 20350925148)",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Consumidor Final",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Retondo Javier (CUIT: 20350925148)",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Retondo Javier (CUIT: 20350925148)",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Consumidor Final",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            },
            {
                fecha: "20/05/2022",
                cliente: "Retondo Javier (CUIT: 20350925148)",
                factura: "X 00004 - 00000015",
                formaPago: "Efectivo",
                totalStr: "3.650,65"
            }
        ]
    }

    const jsreport = JsReport({
        extensions: {
            "chrome-pdf": {
                "launchOptions": {
                    "args": ["--no-sandbox"]
                }
            }
        }
    })
    const writeFileAsync = promisify(fs.writeFile)

    ejs.renderFile(path.join("views", "reports", "cajaList", "index.ejs"), datos, async (err, data) => {
        if (err) {
            console.log('err', err);
            throw new Error("Algo salio mal")
        }

        await jsreport.init()
        jsreport.render({
            template: {
                content: data,
                name: 'lista',
                engine: 'none',
                recipe: 'chrome-pdf',
                chrome: {
                    "landscape": true,
                    "format": "Legal",
                    "scale": 0.8,
                    displayHeaderFooter: true,
                    marginBottom: "2cm",
                    footerTemplate: "<div style='font-size: 14px;text-align: center;widht: 100%;'>Página&nbsp;<span class='pageNumber'></span>&nbsp;de&nbsp;<span class='totalPages'></span></div>",
                    marginTop: "0.5cm",
                    headerTemplate: ""
                },

            },
        })
            .then(async (out) => {
                await writeFileAsync('out.pdf', out.content)
                await jsreport.close()
                res.send("ya esta")
            })
            .catch((e) => {
                res.end(e.message);
            });
    })
}

router
    .get("/newUser", newUser)
    .get("/newFact", newFact)
    .get("/downloadFact", downloadFact)
    .get("/emailfact", vistaEmailFact)
    .get("/cajaListView", listadoCajaView)
    .get("/cajaListPDF", cajaListPDF)
    .get("/newNotaCred", newNotaCred)

export = router;