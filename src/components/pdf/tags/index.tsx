import { Document, Image, Page, Text, View } from '@react-pdf/renderer'
import logo from '../../../../public/logo-nivo.png'
import { styles } from './styles'
import { capitalize } from '../../../utils/capitalize'
import colors from 'tailwindcss/colors'

export type Tag = {
    id: string
    title: string
    slug: string
    quantity: number
}

type TagPDFProps = {
    tags: Tag[]
}

export function TagPDF({ tags }: TagPDFProps) {

    const headers = ["id", "title", "slug", "quantity"]

    return (
        <Document>
            <Page size={"A4"} style={styles.page}>
                <View style={styles.header} fixed>
                    <Image fixed src={logo} style={styles.logo} />
                    <Text style={styles.title}>Lista de Tags</Text>
                </View>
                <Text fixed style={styles.tagLength}>{tags.length} Tag(s) </Text>
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        {headers.map(header => {
                            return (
                                <View key={header} style={header === 'title' ? { ...styles.tableRow, width: 200 } : styles.tableRow}>
                                    <Text style={styles.tableColumn}>
                                        {capitalize(header)}
                                    </Text>
                                </View>
                            )
                        })}
                    </View>
                    <View style={styles.tableBody}>
                        {tags.map((tag, index) => {
                            return (
                                <View style={index % 2 ?
                                    { ...styles.tableRowBody, backgroundColor: colors.zinc[800] }
                                    : { ...styles.tableRowBody, backgroundColor: colors.zinc[600] }
                                }
                                    key={tag.id}
                                    wrap={false}
                                >
                                    <Text style={styles.tableColumnBody}>
                                        {tag.id}
                                    </Text>
                                    <Text style={{ ...styles.tableColumnBody, width: 200 }}>
                                        {tag.title}
                                    </Text>
                                    <Text style={styles.tableColumnBody}>
                                        {tag.slug}
                                    </Text>
                                    <Text style={{ ...styles.tableColumnBody }}>
                                        {tag.quantity}
                                    </Text>
                                </View>
                            )
                        })}
                    </View>
                </View>
            </Page>
        </Document>
    )
}