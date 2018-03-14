

// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'us-east-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    // Provide your Pool Id here
    IdentityPoolId: 'us-east-1:b049e1f9-7053-48ec-9b1c-431f2edb615c',
});
function geturlstuff(){

            theid = window.location.href;
            theloc = theid.indexOf('?id=')+4;
            console.log(theid);
            console.log(theloc);
            return theid.substring(theloc, 200);
        }

function step2(err, data){
    console.log('in the step2');
    $("#wisdom").val(data.city);
    chatBox.pushChat(step3, data);
}
function update_wisdom(data){
    console.log('in the update_wisdom');
    $("#wisdom").val("New job");
    chatBox.pushChat(step2, data);
}

function step3 (err, data){
    console.log('in the step3');
    $("#wisdom").val(data.rolename);
    chatBox.pushChat(logger, data);
}

function logger(err, data){
    console.log('in the logger');
}

function randomNumberFromRange(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}

var randomNumber = randomNumberFromRange(0, 100000);
var lexruntime = new AWS.LexRuntime();
var lexUserId = 'chatbot-demo' + randomNumber + '.' + Date.now();
var sessionAttributes = {};

window.chatBox = (function () {
    var chatBox = {
        main: function () {
            var deviceHeight = document.documentElement.clientHeight;
            var deviceWidth = document.documentElement.clientWidth;
            var bodyHeight = .75;
            var inputHeight = 50;

            if (deviceWidth > 500) {
                bodyHeight = 355 + 'px;';
            }

            else {
                bodyHeight = bodyHeight * deviceHeight;
                bodyHeight = bodyHeight + 'px;';
            }

            var markup = '<div id="chatBox">' +
                             '<div class="body-wrapper">' +
                                '<div class="logo">' +
                                '</div> ' +
                                '<div class="demo-wrapper-main">' +
                                    'Looking for a job?' +
                                '</div> ' +
                                '<div class="demo-wrapper-sub">' +
                                    'Type \'email\' to get started.' +
                                '</div> ' +
                                '<div class="chat-box">' +
                                    '<div class="chat-head">' +
                                        '<div class="chat-head-text">Audrey</div>' +
                                        '<i class="material-icons rotate">expand_more</i>' +
                                    '</div>' +
                                    '<div style="height:' + bodyHeight + '" class="chat-body">' +
                                        '<div id="conversation" class="msg-insert"></div>' +
                                    '</div>' +
                                    '<form id="chatform"  class="chat-text" onsubmit="return chatBox.pushChat(' + logger + ');">' +
                                        '<input id="wisdom" value="" placeholder="How can I help you -- type: email">' +
                                    '</form>' +
                                '</div>' +
                            '</div>' +
                        '</div>';

            $('body').append(markup);

            var arrow = $('.chat-head i');
            var textarea = $('.chat-text input');
            
            arrow.on('click', function () {
                var src = arrow.val();
                $(".rotate").toggleClass("down");
                $('.chat-body').slideToggle('fast');
                $('.chat-text').slideToggle('fast');
                if (src == '&#xE5CF;') {
                   arrow.attr('i', '&#xE5CF;');
                }
                else {
                   arrow.attr('i', '&#xE5CF;');
                }
            });

            // set the focus to the input box
            document.getElementById("wisdom").focus();
        },
        pushChat: function(callback, ledata) {
            // if there is text to be sent...
            var textarea = $('.chat-text input');
            var wisdomText = document.getElementById('wisdom');

            if (wisdomText && wisdomText.value && wisdomText.value.trim().length > 0) {

                        // disable input to show we're sending it
                        var wisdom = wisdomText.value.trim();
                        wisdomText.value = '...';
                        wisdomText.locked = true;
                       
                        // send it to the Lex runtime
                        var params = {
                            botAlias: 'alias_getresume',
                            botName: 'Nagi_ResumeCollector',
                            inputText: wisdom,
                            userId: lexUserId,
                            sessionAttributes: sessionAttributes
                        };
                        chatBox.showRequest(wisdom);
                        lexruntime.postText(params, function (err, data) {
                            if (err) {
                                console.log(err, err.stack);
                                chatBox.showError('Error:  ' + err.message + ' (see console for details)')
                            }
                            if (data) {
                                // capture the sessionAttributes for the next cycle
                                sessionAttributes = data.sessionAttributes;
                                // show response and/or error/dialog status
                                chatBox.showResponse(data);
                            }
                            // re-enable input
                            wisdomText.value = '';
                            wisdomText.locked = false;

                            callback(false, ledata);
                        });
            }    

            textarea.keypress(function (event) {
                var $this = $(this);
                if (event.keyCode == 13) {
                    $(".chat-body").animate({
                        scrollTop: $('.chat-body')[0].scrollHeight - $('.chat-body')[0].clientHeight
                    }, 100);
                }
            });
                // we always cancel form submission
            return false;        
        },
        showRequest: function (daText) {
            var conversationDiv = document.getElementById('conversation');
            var requestPara = document.createElement("P");
            requestPara.className = 'msg-send';
            requestPara.appendChild(document.createTextNode(daText));
            conversationDiv.appendChild(requestPara);
            $(".chat-body").animate({
                scrollTop: $('.chat-body')[0].scrollHeight - $('.chat-body')[0].clientHeight
            }, 100);
        },
        showError: function (daText) {
            var conversationDiv = document.getElementById('conversation');
            var errorPara = document.createElement("P");
            errorPara.className = 'lexError';
            errorPara.appendChild(document.createTextNode(daText));
            conversationDiv.appendChild(errorPara);
            $(".chat-body").animate({
                scrollTop: $('.chat-body')[0].scrollHeight - $('.chat-body')[0].clientHeight
            }, 100);
        },
        showResponse: function (lexResponse) {
            var conversationDiv = document.getElementById('conversation');
            var responsePara = document.createElement("P");
            responsePara.className = 'msg-receive';
            if (lexResponse.message) {
                responsePara.appendChild(document.createTextNode(lexResponse.message));
                responsePara.appendChild(document.createElement('br'));
            }
            if (lexResponse.dialogState === 'ReadyForFulfillment') {
                responsePara.appendChild(document.createTextNode(
                    'Ready for fulfillment'));
                // TODO:  show slot values
            } else {
                responsePara.appendChild(document.createTextNode(
                    //'(' + lexResponse.dialogState + ')'));
            }
            conversationDiv.appendChild(responsePara);
            $(".chat-body").animate({
                scrollTop: $('.chat-body')[0].scrollHeight - $('.chat-body')[0].clientHeight
            }, 100);
        }
    }
    return chatBox;
})();

$(document).ready(function () {
    var socket = io.connect('http://ec2-54-244-71-87.us-west-2.compute.amazonaws.com/');

    socket.on('connect', function(data) {
        socket.emit('join', geturlstuff());
                 });
    $('form').submit(function(e){
                    e.preventDefault();
                    var message = $('#chat_input').val();
                    socket.emit('myevent1', message);
    });
    socket.on('updatelabel', function (data) {
                    console.log('in the updatelabel now..');
                        //update_wisdom(data);
                        
                 });
    chatBox.main();
});
