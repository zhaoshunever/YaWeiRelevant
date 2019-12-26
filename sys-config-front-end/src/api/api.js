import { getAction,deleteAction,putAction,postAction} from '@/api/manage'



const queryPermissionsByUser = (params)=>getAction("/user/privilege",params);
export const ajaxGetDictItems = (code, params)=>getAction(`/sys/dict/getDictItems/${code}`,params);


const checkOnlyUser = (params)=>getAction("/sys/user/checkOnlyUser",params);



//日志管理
//const getLogList = (params)=>getAction("/sys/log/list",params);
const deleteLog = (params)=>deleteAction("/sys/log/delete",params);
const deleteLogList = (params)=>deleteAction("/sys/log/deleteBatch",params);






//系统通告
const doReleaseData = (params)=>getAction("/sys/annountCement/doReleaseData",params);
const doReovkeData = (params)=>getAction("/sys/annountCement/doReovkeData",params);
//获取系统访问量
const getLoginfo = (params)=>getAction("/api/log/loginfo",params);
const getVisitInfo = (params)=>getAction("/api/log/visitInfo",params);





// 重复校验
const duplicateCheck = (params)=>getAction("/sys/duplicate/check",params);


export {
  checkOnlyUser,
  queryPermissionsByUser,
  deleteLog,
  deleteLogList,
  doReleaseData,
  doReovkeData,
  getLoginfo,
  getVisitInfo,
  duplicateCheck,
}



