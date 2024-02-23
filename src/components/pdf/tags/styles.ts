import { StyleSheet } from '@react-pdf/renderer'
import colors from 'tailwindcss/colors'

export const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: colors.zinc[950],
        padding: 16,
        gap: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logo: {
        height: 32,
        objectFit: 'cover'
    },
    title: {
        fontWeight: 'bold',
        fontFamily: 'Helvetica-Bold',
        fontSize: 32,
        color: colors.zinc[200]
    },
    table: {
        width: '100%',
        flexDirection: 'column',
    },
    tableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: colors.teal[500]
    },
    tableColumn: {
        fontWeight: 'bold',
        fontFamily: 'Helvetica-Bold',
        fontSize: 20,
        color: colors.zinc[800]
    },
    tableBody: {
        flexDirection: 'column',
    },
    tableRow: {
        width: 150,
    },
    tagLength: {
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'Helvetica-Bold',
        color: colors.zinc[300]
    },
    tableRowBody: {
        flexDirection: 'row',
        padding: 16,
    },  
    tableColumnBody: {
        fontFamily: 'Helvetica',
        fontSize: 16,
        color: colors.zinc[300],
        justifyContent: 'center',
        width: 150,
    }
})