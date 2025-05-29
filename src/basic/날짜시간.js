const currentTime = new Date()
currentTime.getTime() // *get*xxx() : 리턴값이 있다
const x = currentTime.getTime()
console.log(x);

const hour = currentTime.getHours()
console.log(hour);
const min = currentTime.getMinutes()
console.log(min);
const sec = currentTime.getSeconds()
console.log(sec);

/* const modifyNumber = (1) => {
  if(1 < 10){
    return "0"+1
  }
} */

/* const modifyNumber = ('1') => {
  if(parseInt('1') < 10){
    return "0"+1
  }
} */

const modifyNumber2 = (num) => {
  if(parseInt(num) < 10){
    return "0"+num
  }else{
    return num // else 뒤에가 없을때의 차이를 비교 해보고 좀더 열린 사고로 해보기
  }
}
console.log(modifyNumber2(3));
console.log(modifyNumber2(13));
