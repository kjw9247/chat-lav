// koa프레임워크가 해당 라이브러리를 찾을 수 있다록 선언하였다
// 왜냐면 일을 시켜야 하기 때문에
const Koa = require('koa'); // 1
// const app = new Koa(); // 2
const path = require('path') // 3
const serve = require('koa-static') // 6 - 정적리소스 경로 설정하기
// 15번처럼 js파일에 html을 작성하는것은 비효율적이다
// 그러므로 xxx.html 문서 단위로 렌더링 처리를 요청 할 수 있는
// send라는 함수를 koa-send라이브러리로 부터 제공받는다
const send = require('koa-send') // 7 -html파일을 통쨰로 렌더링 요청가능
const mount = require('koa-mount') // 8 view와 public 구분
const websockify = require('koa-websocket') // 9 - 웹소켓
const app = websockify(new Koa()) // 10 - 머지
const route = require('koa-route') // 11 요청을 구분해서 처리
const { initializeApp } = require("firebase/app"); // 로컬에서 참조함
const { getFirestore } = require("firebase/firestore"); // 로컬에서 참조함
const { setInterval } = require('timers');
const firebaseConfing = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};
// firebase 앱 초기화
const talkApp = initializeApp(firebaseConfing)
const db = getFirestore(talkApp)
//console.log(db); -------------------------터미널에서 출력되는 로그가 너무 많아 임시로 주석으로 막아놓음
// 정적 리소스에 대한 파일 경로 설정하기
const staticPath = path.join(__dirname, './views') // 4

app.use(serve(staticPath)); // 5

// 9 - public의 경로와  views의 경로에 같은파일이 있으면 구별이 안된다
app.use(mount('/public', serve('src/public'))) // 처리(이벤트)- 말하기
// 서버는 5000번 포트를 열어놓고 기다린다 - waiting

// 기본 라우터 설정하기
app.use(async(ctx)=> {
  if(ctx.path === '/'){
    ctx.type = 'text/html'
    // index.html 문서가 하는 일을 여기에 작성해 본다
    ctx.body = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>welcome</title>
      </head>
      <body>
        <h1>welcome to the koa server</h1>
      </body>
      </html>
    `
  }
  // http://localhost:5000/talk
  else if(ctx.path === '/login'){
    await send(ctx, 'login.html', {root: staticPath})
  }
  else if(ctx.path === '/talk'){
    await send(ctx, 'talk.html', {root: staticPath})
  }
  else if(ctx.path === '/notice'){
    await send(ctx, 'notice.html', {root: staticPath})
  }
  else{
    ctx.status = 404
    ctx.body = `Page Not Found`
  }
});//end of use

// npm i koa-route 먼저 설치한다
// 왜냐하면 koa-websocket과 koa-route는 서로 의존관계에 있기 때문에
// Using routes
app.ws.use(
  // ws는 websocket의 약자
  // -> /test/:id로 요청이 오면 아래를 처리하라
  route.all('/ws', async(ctx) => {
  
    // ping/pong설정하기
    //일정시간이 지나면 연결이 끊어진다 - 아무런 움직이 없는 상태로
    const interval = setInterval(() => {
      if(ctx.websocket.readyState === ctx.websocket.OPEN){
        //서버측에서 ping 메시지 전송한다
        ctx.websocket.ping()
      }
    },30000) // 30초마다 ping전송

    ctx.websocket.on('pong', () => {
      console.log('클라이언트로 부터 pong메시지 수신');
    })

  ctx.websocket.on('message', (data) => {
    //클라이언트가 보낸 메시지를 출력한다
    console.log(typeof data); // object인가? string인가?
    if(typeof JSON.stringify(data)!== 'string'){
      return; // if문에서 return을 만나면 콜백 핸들러를 빠져나감
    }
    // string이면 여기로 온다
    const { nickname, message } = JSON.parse(data)
    console.log(`${nickname}, ${message}`);

    /*
    문제제기 - 현재는 메세지를 보낸 사람에게만 돌려주고 있는 유니케스트이다
    만일 모든 사람에게 메세지를 보내고 싶다면 어떻게 해야 할까
    브로드캐스트 처리를 하면 된다
    */

    const { server } = app.ws
    // nill에 대한 체크를 한다
    // sever가 null이면  속성이나 함수를 호출 할 수 없다
    if(!server){// 앞에 not이 있다
      return // return을 만나면 use함수 전체를 탈출함
    }

    server.clients.forEach(client => {
      if(client.readyState === client.OPEN)
        client.send(JSON.stringify({
          message: message,
          nickname : nickname
        }))
    })

  });
}));
    



app.listen(5000);