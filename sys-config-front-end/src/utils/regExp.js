export default {
    isNumber(value) {//数字
        return /^[0-9]+$/.test(value);
    },
    isChinese(value) {//中文
        return /[\u4e00-\u9fa5]+$/.test(value);
    },
    excludeSpecialCharacter(value){//中文、大小写字母、数字和下划线
        return /^[\u4e00-\u9fa5_()~a-zA-Z0-9]+$/.test(value);
    },
    isPhone(value){//手机号码
        return /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/.test(value);
    },
    isEmail(value){//Email
        /**
         * 1、@之前必须有内容且只能是字母（大小写）、数字、下划线(_)、减号（-）、点（.）
           2、@和最后一个.之间必须有内容且只能是字母（大小写）、数字、点（.）、减号（-），且两个点不能紧挨着
           3、最后一个.之后必须有内容且内容只能是字母（大小写）、数字且长度为大于等于2个字节，小于等于6个字节`
         */
        return /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/.test(value);
    },
    isUrl(value){//URL地址
        return /^http[s]?:\/\/.*/.test(value);
    },
    lettersAndNumbers(value){//大小写字母和数字
        return /^[a-zA-Z0-9]+$/.test(value);
    }
}