const monthNamesWhen = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря']
const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']

function y_m_Obj(date_str){
    return {
        m: +date_str.slice(5)-1,
        y: +date_str.slice(0, 4),
    }
}

function getNewID(arr) {
  if(!arr.length)
    return 1;
  let id = 0;
  arr.forEach(obj =>{
    if( obj.id > id )
      id = obj.id;
  });
  return ++id;
}

function capitalizeFirstLetter(str) {
//let str = in_str.toLowerCase()
 return str.charAt(0).toUpperCase() + str.slice(1)
}

function getMonthNameWhen(mnum){
    return monthNamesWhen[mnum]
}

function getMonthName(mnum) {
    return monthNames[mnum]
}
function getPrevMonthName(mnum) {
    return monthNames[(mnum-1 < 0 ? 11 : mnum-1)]
}
function getMonthYearStr(date_str, set_prefix){
    let m = getMonthName( +date_str.substr(5, 2)-1 )
    let y = date_str.substr(0, 4)
    let ret = `${m} ${y}`
    if (set_prefix)
        ret = 'за ' + ret
    return ret
}

// Если поместить этот блок в самом верху, то ф-ии не смогут вызывать друг друга т.к. они станут объектами друг для друга
export{
    y_m_Obj,
    getNewID,
    capitalizeFirstLetter,
    getMonthNameWhen,
    getMonthName,
    getPrevMonthName,
    monthNames,
    getMonthYearStr,
}