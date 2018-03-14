
// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'us-east-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    // Provide your Pool Id here
    IdentityPoolId: 'us-east-1:b049e1f9-7053-48ec-9b1c-431f2edb615c',
});


window.newUser = (function () {
    var newUser = {
        main: function () {
            var deviceHeight = document.documentElement.clientHeight;
            var deviceWidth = document.documentElement.clientWidth;
            var loginHeight = .25 * deviceHeight + 'px;';
            var bodyHeight = .75;
            var inputHeight = 50;
            //var id = 'no-account';

            if (deviceWidth > 500) {
                bodyHeight = 355 + 'px;';
            }

            else {
                bodyHeight = bodyHeight * deviceHeight;
                bodyHeight = bodyHeight + 'px;';
            }

                var markup = '<div class="body-wrapper" style="width:' + deviceWidth + 'px; height:' + deviceHeight + 'px;">' +
                                '<div id="left-half" class="login-wrapper">' +
                                    '<div class="login-form-wrapper">ADRI User Entry' +
                                         '<div class="login-form">' + 
                                            '<div class="login-input" type="text" id="userEmail" data-text="Email" contenteditable=true></div>' +
                                            '<div class="login-input" type="text" id="userName" data-text="Name" contenteditable=true></div>' +
                                        '</div>' +
                                        '<button onclick="newUser.submitUser();" class="positive-long-button">SUBMIT</button>' + 
                                        //'<div onclick="chatBot.ui.modal();" class="text-button">Forgot Password</div>' +
                                    '</div>' +
                                '</div>' +
                                '<div id="no-account" class="modal">' +
                                    '<div class="modal-content">' +
                                        '<button id="closeModal" class="close-modal">&times;</button>' +
                                        '<p>There does not seem to be a record of your account. Please contact the administrator and try again.</p>' +
                                    '</div>' +
                                '</div>' +
                            '</div>';

            $('body').html(markup);
            
            
        },
        submitUser: function () {
            var socket = io.connect('http://ec2-54-244-71-87.us-west-2.compute.amazonaws.com/');
            var userinfo = {};
            var email = $("#userEmail").text();
            var name = $("#userName").text();
            socket.on('connect', function (data) {
                userinfo = {
                    'email': email,
                    'name': name,
                    'personcode': ''
                };
                console.log(userinfo);
                socket.emit('submitUser', userinfo);
                alert('Submission Completed.');
            });
        }
    }
    return newUser;
})();

$(document).ready(function () {
    newUser.main();
});

