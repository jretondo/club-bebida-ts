import fs from 'fs';
import path from 'path';
import { INewProduct } from '../../../interfaces/Irequests';
import XLSX from 'xlsx';
import moment from 'moment';

export const createProdListExcel = async (
    prodList: Array<INewProduct>
) => {
    return new Promise(async (resolve, reject) => {
        try {
            const prodListData = prodList.map((prod) => {
                return {
                    id: prod.id,
                    codigo: prod.cod_barra,
                    nombre: prod.name,
                    proveedor: prod.category,
                    marca: prod.subcategory,
                    precio_compra: prod.precio_compra,
                    porcentaje_ganancia: prod.porc_minor,
                    descuento: prod.discount,
                    precio_venta: prod.vta_price
                }
            })
            const workBook = XLSX.utils.book_new()
            const workSheet = XLSX.utils.json_to_sheet(prodListData)
            XLSX.utils.book_append_sheet(workBook, workSheet, "Compras")
            const uniqueSuffix = moment().format("YYYYMMDDHHmmss")
            const excelAddress = path.join(__dirname, "..", "..", "..", "..", "public", "prod-list", uniqueSuffix + "-Compras.xlsx")
            console.log('excelAddress :>> ', excelAddress);
            XLSX.writeFile(workBook, excelAddress)
            setTimeout(() => {
                fs.unlinkSync(excelAddress)
            }, 2500);
            resolve({
                filePath: excelAddress,
                fileName: uniqueSuffix + "-Productos.xlsx"
            })

        } catch (error) {
            reject(error);
        }
    })
}