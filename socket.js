/**
 * Created by navina on 3/1/17.
 */
/**
 * Created by nikhil on 7/11/16.
 */
var io=require('socket.io');
var socket=new io();
var mongoose=require('mongoose');
var chat=mongoose.model('chat');
var  users={ };

socket.sockets.on('connection',function (socket) {

    var query=chat.find({});
    //query.sort('-Created').limit(8).exec(function (error,docs) {
    query.sort({_id:-1}).limit(10).exec(function (error,docs) {
        //query.limit(10).exec(function (error,docs) {
        if(error) throw  error;
        console.log("sending old messages");
        console.log(docs);
        console.log(docs.length);
        socket.emit('load old messages',docs);
    });

    socket.on('new user', function (data,callback) {
        if (data in users){
            callback(false);
        }else {
            callback(true);
            socket.nickname=data;
            users[socket.nickname]=socket;
            updateNicknames();

        }
    });

    function updateNicknames() {
        socket.emit('usernames',Object.keys(users));
    }

    socket.on('send message', function (data,callback) {
        var msg= data.trim();
        if(msg.substr(0,3)==='/w '){
            msg=msg.substr(3);
            var ind=msg.indexOf(" ");
            if (ind !=-1){
                var name=msg.substr(0, ind);
                var msg=msg.substr(ind + 1);
                if (name in users){
                    users[name].emit('wisper', {msg:msg,nick:socket.nickname});
                    console.log("wisper:");
                }else {
                    callback("Error: enter a valid user");
                }

            }else {
                callback("Error:plese enter a message for your wisper");
            }

        }else{
            var newMsg = new chat({msg:msg,nick:socket.nickname});
            newMsg.save(function (error) {
                if(error) throw error;
                socket.emit('new message', {msg:msg,nick:socket.nickname});
                //socket.broadcast.emit('new message', data);
            });


        }

    });
    socket.on('offer',function (data,callback) {
        var jsonObj=JSON.parse(data);
        var to=jsonObj.to;
        var sdp=jsonObj.sdp;
        if (to in users){
            users[name].emit('offer',{sdp:sdp,from:socket.nickname});
            console.log("offer passed to other end");
        } else {
            callback("info:user not available");
        }
    });



    socket.on('disconnect',function (data) {
        if (!socket.nickname) return;
        delete users[socket.nickname];
        updateNicknames();
    })
});
module.exports=socket;
