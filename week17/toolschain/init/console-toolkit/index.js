// var tty = require('tty');
// var ttys = require('ttys');
// var rl = require('readline');

// var stdin = ttys.stdin;
// var stdout = ttys.stdout;

// // stdout.write('hello  world\n');
// // stdout.write('\033[1A');
// // stdout.write('keelia\n');

// //node readlin 就是对上面的封装
// const readline = require('readline');
// const { futimesSync } = require('fs');

// const nodeRl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

// // nodeRl.question('What do you think of Node.js? ', (answer) => {
// //   // TODO: Log the answer in a database
// //   console.log(`Thank you for your valuable feedback: ${answer}`);

// //   nodeRl.close();
// // });

// async function ask(question) {
//     return new Promise((resolve,reject)=>{
//         nodeRl.question(question, (answer) => {
//             resolve(answer)
//           });
//     })
// }

// void async function(params) {
//     console.log(await ask('What do you think of Node.js? '))
//     nodeRl.close();
// }()

// var stdin = process.stdin

var tty = require('tty');
var ttys = require('ttys');
var rl = require('readline');

var stdin = ttys.stdin;
var stdout = ttys.stdout;

stdin.setRawMode(true)
stdin.resume()
stdin.setEncoding('utf-8')

function getChar() {
    return new Promise(resolve=>{
        stdin.once('data',function(key) {
            resolve(key)
        })
    })
}

function up(n = 1) {
    stdout.write('\033['+n+'A')
}

function down(n = 1) {
    stdout.write('\033['+n+'B')
}

function right(n = 1) {
    stdout.write('\033['+n+'C')
}
function left(n = 1) {
    stdout.write('\033['+n+'D')
}

//实现上下左右光标的选择
void async function (params) {
    stdout.write('which framework do you want to use?\n')
    let answer = await select(['vue','react','angular'])
    stdout.write('you selected '+answer+'\n')
    process.exit()
}()

async function select(choices) {
    let selected = 0
    for (let i = 0; i<choices.length;i++) {
        let choice = choices[i]
        if(i === selected){
            stdout.write('[\x1b[32mx\x1b[0m]'+choice +'\n')
        }else{
            stdout.write('[ ]'+choice +'\n')
        }
    }
    up(choices.length)
    right()
    while(true){
        let char = await getChar()
        if(char === '\u0003'){
            down(choices.length)
            left()
            process.exit()
            break;
        }
        if(char === "w" && selected > 0){
            stdout.write(' ')
            left()
            selected--;
            up()
            stdout.write('\x1b[32mx\x1b[0m')
            left()
        }
        if(char === "s" && selected < choices.length - 1){
            stdout.write(' ')
            left()
            selected++;
            down()
            stdout.write('\x1b[32mx\x1b[0m')
            left()
        }
        if(char === '\r'){
            down(choices.length - selected)
            left()
            return choices[selected]
        }
    }
    
}