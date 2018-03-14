
// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'us-east-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    // Provide your Pool Id here
    IdentityPoolId: 'us-east-1:b049e1f9-7053-48ec-9b1c-431f2edb615c',
});

window.constants = {
    interview: {// Mark
        id: '',
        user: '',
        client: '',
        ui: ''
    },
    chat: {
        count: 0
    },
    urls: {
    }
};

function geturlstuff() {
    theid = window.location.href;
    theloc = theid.indexOf('?id=') + 4;
    return theid.substring(theloc, 200);
}
function pChatUserWatcher(err, data) {
    $("#wisdom").val(data['emailaddress']);
    chatBox.pushChatUser(logger, data);
}
function pChatWatcher(err, data) {
    $("#wisdom").val(data['emailaddress']);
    chatBox.pushChat(logger, data);
} 
function update_wisdom(data) {
    data = data || '';
    if (data == '' || data == null || data == undefined) {
        $("#wisdom").val("New job");
        chatBox.pushChat(pChatWatcher, data);
    }

    else {
        $("#wisdom").val("New job");
        chatBox.pushChatUser(pChatUserWatcher, data);
    }
}
function step3(err, data) {
    //console.log('in the step3');
    $("#wisdom").val(data.rolename);
    chatBox.pushChat(logger, data);
}
function logger(err, data) {
    //console.log('in the logger');
}
function randomNumberFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function greetUser(data) {
    alert('hello ' + data);
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
                                '<div class="logo-wrapper">A<div class="logo-dot"></div> </div>' +
                            '</div> ' +
                            '<div class="demo-wrapper-main">' +
                                'Audrey is our groundbreaking intelligent, constantly learning, deeply analytical process / application that sifts through large and ever increasing dynamic applicant pools to validate and quality candidates. Further, it can help and automatically schedule conversations with  the right candidates 24x7 on different channels like web, mobile SMS using AI, machine learning and BOT frameworks. ADRI is designed to integrate with WORKDAY and other HCMS and ATS applications' +
                                '<br>' +
                                '<br>' +
                                'Our products are always designed with customer and industry inputs. As a thought leader in Talent Acquisition, we would be obliged if you can try it out and provide us your valuable insights to help pioneer new cutting edge technologies in talent acquisition strategy.' +
                                '<br>' +
                                '<br>' +
                                '<span style="font-weight:bold; font-size=12pt">' +
                                    'Challenges' +
                                '</span>' +
                                '<br>' +
                                '<br>' +
                                'Candidates in your historical database need to be validated to determine availability for your current openings cost effectively. Candidates who have applied to current positions need to be contacted and scheduled for screening / initial calls by recruiters to achieve scale of hiring and rapid response in addition to optimal time utilization. Timeliness is the key in a shrinking labor pool.' +    
                                '<br>' +
                                '<br>' +
                                '<span style="font-weight:bold; font-size=12pt">' +
                                    'Candidate Experience' +
                                '</span>' +
                                '<br>' +
                                '<br>' +
                                '      - Candidate receives a customized email or SMS message<br>' +
                                '      - Candidate is directed to the BOT based front end to the application suite<br>' +
                                '      - Candidate is guided through setting communication preferences (opt out, available immediately, available later etc)<br>' +
                                '      - Candidates available immediately can be scheduled for a screening call if customers desire.<br>' +
                                '      - Utilize natural language conversation models<br>' +
                                '<br>' +
                                '<br>' +
                                '<span style="font-weight:bold; font-size=12pt">' +
                                    'Talent Acquisition Benefits:' +
                                '</span>' +
                                '<br>' +
                                '<br>' +
                                '      - Scale TA Ops to meet hiring needs from few to thousands of hires rapidly <br>' +
                                '      - Validate candidate pools cost effectively<br>' +
                                '      - Provide a cutting-edge easy to use candidate experience, using technologies they are familiar with. Its proven already with general labor pools.<br>' +
                                '      - Customizable for each client needs.<br>' +
                                '      - Front end application to monitor everything in the system<br>' +
                                '      - Data integration with WORKDAY and other HCMS applications.<br>' +
                                '<br>' +
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
                                    '<input id="wisdom" value="" placeholder="Respond here!">' +
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
        pushChat: function (callback, ledata) {
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
                    botAlias: 'getresume',
                    botName: 'adriBot',
                    inputText: wisdom,
                    userId: lexUserId,
                    sessionAttributes: sessionAttributes
                };
                constants.chat.count++;

                if (constants.chat.count > 1) {
                    chatBox.showRequest(wisdom);
                }
                
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
        pushChatUser: function (callback, ledata) {
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
                    botAlias: 'getresume',
                    botName: 'adriBot',
                    inputText: wisdom,
                    userId: lexUserId,
                    sessionAttributes: sessionAttributes
                };
                constants.chat.count++;
                if (constants.chat.count > 2) {
                    chatBox.showRequest(wisdom);
                }
                lexruntime.postText(params, function (err, data) {
                    if (err) {
                        console.log(err, err.stack);
                        chatBox.showError('Error:  ' + err.message + ' (see console for details)')
                    }
                    if (data) {
                        // capture the sessionAttributes for the next cycle
                        sessionAttributes = data.sessionAttributes;
                        // show response and/or error/dialog status
                        if (constants.chat.count > 1) {
                            chatBox.showResponse(data);
                        }
                    }
                    // re-enable input
                    wisdomText.value = '';
                    wisdomText.locked = false;

                    callback(false, ledata);
                    var c = $('#conversation').children();
                    //console.log(c);
                });
            }
            //window.location.href = "http://new.website.com/that/you/want_to_go_to.html";
            $('.logo-wrapper').on('click', function () {
                window.location.href = '/newUser.html';
            });

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
                //responsePara.appendChild(document.createTextNode('(' + lexResponse.dialogState + ')'));
            }
            conversationDiv.appendChild(responsePara);
            $(".chat-body").animate({
                scrollTop: $('.chat-body')[0].scrollHeight - $('.chat-body')[0].clientHeight
            }, 100);
        },
        util: {
            getURLParams: function () {
                var uParts = window.location.href.split('?id=')[1] || '';
                if (uParts != '') {
                    constants.interview.user = uParts;
                    console.log(constants);
                    return constants.interview.user;
                }
            }
        }
    }
    return chatBox;
})();

$(document).ready(function () {
    var socket = io.connect('http://ec2-54-244-71-87.us-west-2.compute.amazonaws.com/');

    socket.on('connect', function (data) {
        socket.emit('join', geturlstuff());
        //socket.emit('decrypt', chatBox.util.getURLParams());
    });
    $('form').submit(function (e) {
        e.preventDefault();
        var message = $('#chat_input').val();
        socket.emit('myevent1', message);
    });
    socket.on('updatelabel', function (data) {
        console.log(data);
        update_wisdom(data);
    });
    chatBox.main();
});