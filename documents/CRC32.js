//function CRC32(data)
//{
//        var remainder;
//        
//        
//        /*
//         * Initially, the dividend is the remainder.
//         */
//        remainder = data;
//        var i = 0;
//        /*
//         * For each bit position in the message....
//         */
//        for (i = 8; i > 0; --i)
//        {
//                /*
//                 * If the uppermost bit is a 1...
//                 */
//                if (remainder & 0x80)
//                {
//                        /*
//                         * XOR the previous remainder with the divisor.
//                         */
//                        remainder ^= 1011;
//                }
//                
//                /*
//                 * Shift the next bit of the message into the remainder.
//                 */
//                remainder = (remainder << 1);
//        }
//        
//        /*
//         * Return only the relevant bits of the remainder as CRC.
//         */
//        return (remainder >> 4);
//        
//}
//
//console.log(CRC32(1011));

function CRC32_(data) {
        console.log(data.toString(2));  // convert decimal to binary
        console.log(data.toString(2).length);
        var binary_data = data.toString(2);
        var divisor = 1011;
        var len_data = data.toString(2).length;
        var len_divisor = 4;  //divisor.toString().length
        var i, j;
        var crc_data = "0".repeat(len_data);
        
        for (i = 0; i < len_data; ++i) {
                for (j = 0; j < len_divisor; ++j) {
                        console.log(i+j);
                        console.log(String(binary_data).charAt(i + j), "---", String(divisor).charAt(j));
                        if (String(binary_data).charAt(i + j) == String(divisor).charAt(j)) {
                                crc_data = crc_data.charAt(i+j) = ("0");
                                console.log("same");
                        } else {
                                crc_data = crc_data.charAt(i+j) = ("1");
                                console.log("diff");
                        }
                }
        }
        return crc_data;
}

console.log(CRC32_(13548));





























