
String.prototype.toPhone = function () {
    return this.replace(/(\d\d\d)(\d\d\d)(\d\d\d\d)/, '$1-$2-$3');
};

AWS.config.region = 'us-east-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    // Provide your Pool Id here
    IdentityPoolId: 'us-east-1:b049e1f9-7053-48ec-9b1c-431f2edb615c',
});

window.constants = {
    interview: {// Mark
        id: 'QURSSTAwMDItNTIyNzY1LVI1NTM0',
        user: '12345',
        client: 'UkJTREVNTzIwMTcwODE4',
        ui: 'aHR0cHM6Ly9zMy11cy13ZXN0LTIuYW1hem9uYXdzLmNvbS93d3cucmVjcnVpdGluZy5hZHJpLXN5cy5jb20v'
    },
    urls: {
        getTimeSlots: appconfig.api.base + '/' + appconfig.api.stage + '/getTimeSlots',
        addTimeSlot: appconfig.api.base + '/' + appconfig.api.stage + '/addTimeSlot',
        getInterview: appconfig.api.base + '/' + appconfig.api.stage + '/GetInterviewDetails',
        addInterview: appconfig.api.base + '/' + appconfig.api.stage + '/AddEvent',
        validateUser: appconfig.api.base + '/' + appconfig.api.stage + '/validateUser',
        getUsers: appconfig.api.base + '/' + appconfig.api.stage + '/getUsers',
        deleteTimeSlot: appconfig.api.base + '/' + appconfig.api.stage + '/deleteTimeslot',
        deleteUser: appconfig.api.base + '/' + appconfig.api.stage + '/deleteUser',
        addUsers: appconfig.api.base + '/' + appconfig.api.stage + '/addUsers',
        getUnscheduledInterviews: appconfig.api.base + '/' + appconfig.api.stage + '/getInterviews',
        getInterviewsDate: appconfig.api.base + '/' + appconfig.api.stage + '/getInterviewsDate',
        getPositions: appconfig.api.base + '/' + appconfig.api.stage + '/getPositions',
        addPosition: appconfig.api.base + '/' + appconfig.api.stage + '/addPosition',
        getUserTimeSlots: appconfig.api.base + '/' + appconfig.api.stage + '/getAvailabilityUser',
        notifyUser: appconfig.api.base + '/' + appconfig.api.stage + '/NotifyUser',
        persistentAvailability: appconfig.api.base + '/' + appconfig.api.stage + '/updatePersistentUserInfo',
        optout: appconfig.api.base + '/' + appconfig.api.stage + '/optOut',
        uploadFile: appconfig.api.base + '/' + appconfig.api.stage + '/uploadFile',
        removeReq: appconfig.api.base + '/' + appconfig.api.stage + '/removeReq'
    }
};

window.adri = (function () {

    function ADRITime(d, h, m, p, s) {
        this.interviewID = constants.interview.id;
        this.userID = adri.interview.scheduling.userID;
        this.date = d;
        this.hour = h;
        this.minute = m;
        this.period = p;
        this.status = s;
    }

    function APITimeSlot(timeslot) {
        this.interviewID = timeslot.interviewID;
        this.userID = timeslot.userID;
        this.status = timeslot.status;

        var ts = +timeslot.hour;
        if (timeslot.period.toLowerCase() == 'pm' && timeslot.hour != 12) {
            ts += 12;
        }
        else if (timeslot.period.toLowerCase() == 'am' && timeslot.hour == 12) {
            ts = '00';
        }
        ts = '' + ts + ':' + timeslot.minute + ':00';
        ts = timeslot.date + ' ' + ts;

        this.timeSlot = ts;
        this.clientID = constants.interview.client;
        this.uiID = constants.interview.ui;

    }

    function APITimeInstance(timeslot) {
        this.interviewID = timeslot.interviewID;
        this.userID = timeslot.userID;
        this.status = timeslot.status;
        var inst = timeslot.schedule.starttime;
        inst.hour = +inst.hour;

        if (inst.period.toLowerCase() == 'pm' && inst.hour != 12) {
            inst.hour += 12;
        }
        else if (inst.period.toLowerCase() == 'am' && inst.hour == 12) {
            inst.hour = '00';
        }

        var ts = timeslot.date + ' ' + inst.hour + ':' + inst.minutes + ':00';

        this.timeSlot = ts;
        this.clientID = constants.interview.client;
        this.uiID = constants.interview.ui;

    }

    function timePeriod(h, m, p) {
        this.hour = h || '1';
        this.minutes = m || '01';
        this.period = p || 'AM';
    }

    function ADRIBlock() {
        this.starttime = new timePeriod();
        this.endtime = new timePeriod();
        this.lunchstart = new timePeriod();
    }

    function BlockDay(d) {
        this.day = d || '';
        this.schedule = new ADRIBlock();
    }

    function BlockDate(d) {
        this.date = d || '';
        this.schedule = new ADRIBlock();
    }

    function DDOption(value, text) {
        text = text || value;
        return '<option value="' + value + '">' + text + '</option>';
    }

    function DDSelectedOption(value, text) {
        text = text || value;
        return '<option selected="selected" value="' + value + '">' + text + '</option>';
    }

    var adri = {
        data: {},
        colors: ['#FFD555', '#6764E6', '#FFB955', '#348CD5', '#6416C6', '#1172C2', '#FFF156', '#07589C'],
        tcolors: ['#6764E6', '#348CD5', '#6416C6', '#1172C2', '#07589C'],
        id: '',
        init: function () {
            adri.ui.loader(true, "dynamic-content-loader");
            adri.util.getURLParams();
            adri.ui.zone();
            adri.ui.nav.setup();
            adri.ui.dashboard.open();
        },
        error: {
            noParams: function () {
                $('#adri-ras-content').html('Sorry, but we couldn\'t find your information. Please try clicking your invitation link again.');
            }
        },
        ui: {
            selectedDate: '',
            labels: {
                data: {
                    ths: '',
                    id: '',
                    height: '',
                    width: '',
                    mheight: '',
                    mwidth: '',
                    delay: 500
                },
                initLabels: function () {
                    $(document).ready(function () {

                        //$(document).tooltip();
                    });
                }
            },
            settings: {
                setupReq: function () {
                    var $Content = $('.ui-content-body');
                    var iCard = '<div id="db-weekly-view" class="centered dashMain-title">' +
                        '<div style="margin-left:0;" class="dashboard-header-block"><div class="dashboard-header-text">Requistions and Links</div></div>' +
                        '</div>' +
                        '<div id="db-scheduling" class="dashboard-scheduling">' +
                        '<div id="scheduled-interviews-container" class="fullWidth-container ">' +
                        '<div id="position-pool"></div>' +
                        '</div>' +
                        '</div>' +
                        '<div id="modal-form" class="modal-form"></div>' +
                        '<div id="smallModal" class="modal-small"></div>' +
                        '<div id="modal-bg-overlay" class="modal-overlay" onclick="adri.timeslot.removeControls();"></div>' +
                        '<div id="small-modal-bg-overlay" class="modal-overlay" onclick="adri.ui.modal.small.close();"></div>' +
                        '<div id="error-modal" class="modal">' +
                        '<div id="availError" class="modal-content">' +
                        '<button id="closeModal" class="close-modal" onclick="adri.ui.modal.error.close();">&times;</button>' +
                        '</div>' +
                        '</div>';
                    $Content.html(iCard);
                },
                addPositions: function () {
                    adri.ui.selected('dashboard-sub-icon1', 'control-sub-label-act');
                    var db = adri.ui.dashboard;

                    var $Content = $('.ui-content-body');
                    var iCard = '<div id="db-weekly-view" class="centered dashMain-title">' +
                        '<div style="margin-left:0;" class="dashboard-header-block"><div class="dashboard-header-text">Add Position</div></div>' +
                        '</div>' +
                        '<div id="db-scheduling" class="dashboard-scheduling">' +
                        '<div id="scheduled-interviews-container" class="fullWidth-container ">' +
                        '<div id="position-pool"></div>' +
                        '</div>' +
                        '</div>';
                    $Content.html(iCard);
                    adri.ui.dashboard.addPosition();
                    var $options = $('#scheduled-interviews-container');
                    var control = '<div class="spacer"></div><div class="spacer"></div>' +
                        //'<button onclick="adri.ui.dashboard.addPosition();" class="button thin hlBG negTxt"><span>ADD POSITION</span></button>' +
                        '<button class="bigButton mainBG negTxt ckable" onclick="adri.ui.submitPosition(adri.ui.dashboard.refreshPool)">SUBMIT</button>';

                    $options.append(control);
                },
                openReqs: function () {
                    var elid = "dynamic-content-loader";
                    var db = adri.ui.dashboard;
                    adri.ui.loader(true, elid);
                    adri.ui.settings.setupReq();
                    db.getPositions(function (data) {
                        db.drawPositionPool(data);
                    });
                }
            },
            zone: function () {
                //Mark: Removed splash class/id and added the control-ribbon element. Also changed it to update the adri-ras-content id instead of the core-content id.
                var elid = "dynamic-content-loader";
                var zones = '<div id="adri-ras-content" class="content-area">' +
                    '<div class="ui-zone-tabular">' +
                    '<div class="ui-zone-row">' +
                    '<div id="left-nav" class="control-ribbon"></div>' +
                    '<div id="dynamic-content-area" class="ui-content-slide"></div>' +
                    '<div id=' + elid + ' class="loaderContainer"></div>' +
                    '</div>' +
                    '</div>' +
                    '<div id="core-content" class="dynamicContent" style="display: block;"></div>' +
                    '</div>';


                $('body').html(zones);
            },
            selected: function (id, cl) {
                cl = cl || '';
                $('.' + cl).removeClass(cl);
                $('#' + id).toggleClass(cl);
            },
            nav: {
                reset: function () {
                    adri.ui.nav.template.idcount = {
                        main: 0,
                        sub: 0
                    };
                },
                setupOld: function () {
                    var nav = '';
                    var menu = [
                        //{ adr: '', txt: appconfig.alias.interview + 's', type: 'staticHeader' },
                        //{ adr: 'alert(\'Please enable range filtering in the configuration settings.\');', txt: appconfig.alias.interview + 's Today', type: 'link' },
                        //{ adr: 'alert(\'Please enable range filtering in the configuration settings.\');', txt: appconfig.alias.interview + 's This Week', type: 'link' },
                        //{ adr: 'alert(\'Please enable range filtering in the configuration settings.\');', txt: appconfig.alias.interview + 's This Month', type: 'link' },
                        { adr: '', txt: 'Scheduling', type: 'staticHeader' },
                        { adr: 'adri.ui.dashboard.open();', txt: 'Dashboard', type: 'link' },
                        { adr: 'adri.user.info.launchEditForm();', txt: 'Edit Availability', type: 'link' },
                        //{ adr: '', txt: 'Pipeline', type: 'staticHeader' },
                        //{ adr: 'alert(\'Please enable pipelines in the configuration settings.\');', txt: appconfig.alias.candidate + 's waiting to schedule', type: 'link' },
                        { adr: '', txt: 'Reports', type: 'staticHeader' },
                        { adr: 'adri.ui.nav.open(\'' + atob(constants.interview.ui) + 'reports.html?cliid=' + constants.interview.client + '\');', txt: 'My Reports', type: 'link' },
                        { adr: '', txt: 'Positions', type: 'staticHeader' },
                        { adr: 'adri.ui.settings.open();', txt: 'My Positions', type: 'link' },
                        { adr: '', txt: appconfig.alias.candidate + 's', type: 'staticHeader' },
                        { adr: 'adri.util.uploader.open();', txt: 'Upload ' + appconfig.alias.candidate + 's', type: 'link' },
                        { adr: 'adri.util.uploader.template();', txt: 'File Uploader Template', type: 'link' }
                        //adri.ui.settings.open()
                    ];

                    var lim = menu.length;
                    for (var i = 0; i < lim; i++) {
                        nav = nav + adri.ui.nav.template[menu[i].type](menu[i].txt, menu[i].adr);
                    }
                    $('#rpts-widget').attr('onclick', 'adri.ui.nav.open(\'' + atob(constants.interview.ui) + 'reports.html?cliid=' + constants.interview.client + '\');');
                    $('#left-nav').html(nav);
                },
                setup: function () {
                    var nav = '';
                    var menu = [ //<i class="material-icons">&#xE8B6;</i>
                        { adr: '', txt: '', type: 'lLogo', icon: '' },
                        { adr: 'adri.ui.dashboard.open();', txt: 'Dashboard', type: 'dashBtn', icon: '&#xE7FB;' },
                        { adr: 'adri.ui.nav.actionsSetup();', txt: 'Actions', type: 'dashBtn', icon: '&#xE3C9;' },
                        { adr: 'adri.ui.modal.open();', txt: 'Edit Availability', type: 'dashBtn', icon: '&#xE8F9;' },
                        { adr: 'adri.ui.nav.reportsSetup();', txt: 'Reports', type: 'dashBtn', icon: '&#xE8F9;' },
                        { adr: 'adri.ui.nav.searchSetup();', txt: 'Search', type: 'dashBtn', icon: '&#xE8B6;' }
                    ];

                    var lim = menu.length;
                    for (var i = 0; i < lim; i++) {
                        nav = nav + adri.ui.nav.template[menu[i].type](menu[i].txt, menu[i].adr, menu[i].icon);
                    }
                    $('#rpts-widget').attr('onclick', 'adri.ui.nav.open(\'' + atob(constants.interview.ui) + 'reports.html?cliid=' + constants.interview.client + '\');');
                    $('#left-nav').html(nav);
                    adri.ui.labels.data.height = document.documentElement.clientHeight;
                    adri.ui.labels.data.width = document.documentElement.clientWidth;
                },
                actionsSetup: function () {
                    adri.ui.nav.reset();
                    var nav = '';
                    var menu = [
                        { txt: 'Positions', type: 'subHeader' },
                        { adr: 'adri.ui.settings.addPositions();', txt: 'Add Positions', type: 'dashSubBtn' },
                        { adr: 'adri.ui.settings.openReqs();', txt: 'Edit Requisitions', type: 'dashSubBtn' },
                        { type: 'subSpacer' },
                        { txt: 'Candidates', type: 'subHeader' },
                        { adr: 'adri.util.uploaderNew.open();', txt: 'Upload Candidates', type: 'dashSubBtn' },
                    ];

                    var lim = menu.length;
                    for (var i = 0; i < lim; i++) {
                        nav = nav + adri.ui.nav.template[menu[i].type](menu[i].txt, menu[i].adr, menu[i].icon);
                    }
                    $('#contentRibbon').html(nav);
                    adri.ui.settings.addPositions();
                },
                reportsSetup: function () {
                    adri.ui.nav.reset();
                    var nav = '';
                    var menu = [
                        { txt: 'Reports', type: 'subHeader' },
                        { adr: 'adri.ui.dashboard.reports.open();', txt: 'Interactions', type: 'dashSubBtn' },
                        { adr: 'adri.ui.nav.open(\'' + atob(constants.interview.ui) + 'reports.html?cliid=' + constants.interview.client + '\');', txt: 'My Reports', type: 'dashSubBtn' }
                    ];

                    var lim = menu.length;
                    for (var i = 0; i < lim; i++) {
                        nav = nav + adri.ui.nav.template[menu[i].type](menu[i].txt, menu[i].adr, menu[i].icon);
                    }
                    $('#contentRibbon').html(nav);
                    adri.ui.dashboard.reports.open();
                },
                searchSetup: function () {
                    adri.ui.modal.error.open('Coming Soon!');
                },
                template: {
                    idcount: {
                        main: 0,
                        sub: 0
                    },
                    dashBtn: function (txt, adr, icon) {
                        adri.ui.nav.template.idcount.main++;
                        var count = adri.ui.nav.template.idcount.main;
                        var theid = 'dashboard-icon' + count;
                        var cl = 'control-wrap-act';
                        var clk = 'adri.ui.selected(\'' + theid + '\', \'' + cl + '\');';
                        return '<div onclick="' + adr + clk + '" id="' + theid + '" class="control-wrap">' +
                            '<div class="control-button">' +
                            '<i class="material-icons">' + icon + '</i>' +
                            '</div>' +
                            '<div class="control-label">' + txt + '</div>' +
                            '</div>';
                    },
                    dashSubBtn: function (txt, adr, icon) {
                        adri.ui.nav.template.idcount.sub++;
                        var count = adri.ui.nav.template.idcount.sub;
                        var theid = 'dashboard-sub-icon' + count;
                        var cl = 'control-sub-label-act';
                        var clk = 'adri.ui.selected(\'' + theid + '\', \'' + cl + '\');';
                        return '<div onclick="' + adr + clk + '" class="control-sub-wrap">' +
                            '<div id="' + theid + '" class="control-sub-label"><span>' + txt + '</span></div>' +
                            '</div>';
                    },
                    subHeader: function (txt) {
                        return '<div class="subHeader">' + txt + '</div>';
                    },
                    subSpacer: function (txt) {
                        return '<div class="spacer"></div>';
                    },
                    lLogo: function (txt, adr, icon) {
                        return '<div class="companyLogo">A<div class="logo-dot"></div> </div>';
                    },
                    link: function (txt, adr) {
                        return '<div class="ckablef maintxt offset-l small-pad" onclick="' + adr + '">' + txt + '</div>';
                    },
                    linkHeader: function (txt, adr) {
                        return '<div class="ckablef maintxt med-pad" onclick="' + adr + '">' + txt + '</div>';
                    },
                    staticHeader: function (txt, adr) {
                        return '<div class="infoTxt med-pad">' + txt + '</div>';
                    }
                },
                open: function (url) {
                    var win = window.open(url, '_blank');
                    win.focus();
                }
            },
            initialize: function () {
                adri.user.validate(adri.ui.checkUser);
            },
            checkUser: function (user) {
                var welcome = 'Welcome, ' + user.firstName + ' ' + user.lastName + '!';
                $('#welcome-box').html(welcome);
                adri.ui.route[user.role](user);
            },
            route: {
                'Recruiter': function (user) {
                    adri.interview.get(function (data) {
                        adri.interview.loadToUI(data);
                        adri.interview.getUsers(function (data) {
                            adri.interview.addUserNodes(data);
                            adri.ui.availability.get(function (data) {
                                adri.ui.availability.drawUserTimes(data);
                            });
                        });
                    });
                },
                'Candidate': function (user) {

                },
                'Interviewer': function (user) {
                    adri.interview.get(function (data) {

                        adri.interview.loadToUI(data);
                        adri.interview.getUsers(function (data) {
                            adri.interview.addUserNodes(data);
                            adri.ui.availability.get(function (data) {
                                adri.ui.availability.drawUserTimes(data);
                            });
                        });
                    });
                },
                'INVALID': function () {

                }
            },
            dashboard: {
                open: function () {
                    adri.user.validate(adri.ui.dashboard.checkUser);
                },
                checkUser: function (user) {
                    //Mark: Manually entering the user. Need to remove when beginning to test. 
                    user = {
                        role: 'Recruiter',
                        name: 'Support'
                    };
                    var welcome = 'Welcome, ' + user.firstName + ' ' + user.lastName + '!';
                    $('#welcome-box').html(welcome);
                    adri.ui.dashboard.route[user.role](user);
                },
                route: {
                    'Recruiter': function (user) {

                        var db = adri.ui.dashboard;

                        db.setup();
                        $('.dynamicContent').fadeIn('fast');

                        db.getPositions(function (data) {
                            db.setPositionFilters(data);
                        });

                        db.getInterviews(function (data) {
                            db.drawInterviews(data);
                        });
                        var elid = "dynamic-content-loader";
                        adri.ui.loader(false, elid);
                    },
                    'Candidate': function (user) {

                    },
                    'Interviewer': function (user) {
                        var db = adri.ui.dashboard;
                        db.setup();
                        $('.dynamicContent').fadeIn('fast');

                        db.getPositions(function (data) {
                            db.setPositionFilters(data);
                        });

                        db.getInterviews(function (data) {
                            db.drawInterviews(data);
                        });

                        db.getUnscheduledInterviews(function (data) {
                            db.drawUnscheduledInterviews(data);
                        });
                        var elid = "dynamic-content-loader";
                        adri.ui.loader(false, elid);
                    },
                    'INVALID': function () {

                    }
                },
                deleteUser: function (id, interviewID) {
                    var db = adri.ui.dashboard;

                    $('#loader-' + id).html('<div class="centered vCenter">Removing...</div>');
                    $('#loader-' + id).stop();
                    $('#loader-' + id).fadeIn(50);

                    var jsData = {
                        id: id,
                        clientID: constants.interview.client,
                        userID: constants.interview.user,
                        uiID: constants.interview.ui,
                        interviewID: btoa(interviewID)
                    };

                    $.ajax({
                        type: "POST",
                        contentType: 'application/json',
                        dataType: "json",
                        url: constants.urls.deleteUser,
                        data: JSON.stringify(jsData),
                        success: function (data) {
                            db.getUnscheduledInterviews(function (data) {
                                db.drawUnscheduledInterviews(data);
                            });
                        },
                        error: function (xhr, ajaxOptions, error) {
                            console.log(xhr);
                        }
                    });
                },
                setup: function () {
                    /*Mark: Added the .loadNew function to invoke automatically as part of the chain. 
                    Changes had to be made to .load for the new calendar on the left-hand side of dashboard.
                    Unscheduled-interviews-container has been removed from this view. Moved the day range display to 
                    the frameWeeklyView function in order for it to display further up.*/
                    $('#page-title').html('Scheduling Dashboard');
                    var $el = $('#dynamic-content-area');
                    var wkDate = new Date();
                    var getUnscheduled = function (data) {
                        adri.ui.dashboard.drawUnscheduledInterviews(data);
                    };

                    var dash = '<div id="contentRibbon" class="ui-content-ribbon">' +
                        '<div id="availabilityView" class="timeContainerSmall"></div>' +
                        '</div>' +
                        '<div id="modal-form" class="modal-form"></div>' +
                        '<div id="smallModal" class="modal-small"></div>' +
                        '<div id="modal-bg-overlay" class="modal-overlay" onclick="adri.timeslot.removeControls();"></div>' +
                        '<div id="small-modal-bg-overlay" class="modal-overlay" onclick="adri.ui.modal.small.close();"></div>' +
                        '<div id="error-modal" class="modal">' +
                        '<div id="availError" class="modal-content">' +
                        '<button id="closeModal" class="close-modal" onclick="adri.ui.modal.error.close();">&times;</button>' +
                        '</div>' +
                        '</div>' +
                        '<div class="ui-content-body">' +
                        '<div id="db-weekly-view" class="dashMain-title">' +
                        '<button id="toggleScheduled" class="mediumClear" title="Check your unscheduled prospects" onclick="adri.ui.dashboard.getUnscheduledInterviews(' + getUnscheduled + ');"></button>' +
                        '<div class="lineSpacer"></div>' +
                        adri.util.controls.calendarSmall.drawWeeklyView(wkDate) +
                        '<button onclick="adri.ui.dashboard.open();" title="Refresh" class="refresh-button">&#xE5D5;</button>' +
                        '</div>' +
                        '<div id="db-scheduling" class="dashboard-scheduling">' +
                        '<div id="scheduled-interviews-container" class="fullWidth-container ">' +
                        '<div id="interviews"></div>' +
                        '</div>' +
                        '</div>' +
                        '</div>';
                    $el.html(dash);
                    adri.ui.time.loadNew('contentRibbon');
                },
                dateReset: {
                    scheduled: function () {
                        var db = adri.ui.dashboard;
                        db.getInterviews(function (data) {
                            $('#sch-selected-date').html('Next 7 Days');
                            db.drawInterviews(data);
                            db.drawInterviewsForDate(data);
                        });
                    }
                },
                filter: {
                    scheduled: function () {
                        var db = adri.ui.dashboard;

                        if (!adri.ui.selectedDate || adri.ui.selectedDate === '') {
                            db.getInterviews(function (data) {
                                db.drawInterviews(data);
                                //db.drawInterviewsForDate(data);
                            });
                        }
                        else {
                            db.getInterviewsDate(adri.ui.selectedDate, function (data) {
                                db.drawInterviewsForDate(data);
                            });
                        }

                    },
                    unscheduled: function () {
                        var db = adri.ui.dashboard;
                        db.getUnscheduledInterviews(function (data) {
                            db.drawUnscheduledInterviews(data);
                        });
                    }
                },
                getInterviewsForDate: function (date, dis) {
                    var db = adri.ui.dashboard;
                    adri.ui.selectedDate = date;
                    $('#sch-selected-date').html(dis);
                    db.getInterviewsDate(date, function (data) {
                        db.drawInterviewsForDate(data);
                    });
                },
                getInterviews: function (onComplete) {
                    var socket = io.connect('http://ec2-54-244-71-87.us-west-2.compute.amazonaws.com/');
                    socket.on('connect', function (data) {
                        socket.emit('getInterviews', constants.interview.user);
                    });

                    socket.on('recieveGet', function (data) {
                        onComplete(data);
                    });
                    /*
                    var posFilter = $('#sch-position-filter').val() || 'All';

                    $.ajax({
                        type: "GET",
                        contentType: 'application/json',
                        dataType: "json",
                        url: constants.urls.getUserTimeSlots + "?uid=" + constants.interview.user + '&uiid=' + constants.interview.ui + '&cliid=' + constants.interview.client + '&pfl=' + btoa(posFilter),
                        success: function (data) {
                            onComplete(data[0]);
                        },
                        error: function (xhr, ajaxOptions, error) {
                            console.log(xhr);
                        }
                    });
                    */
                },
                getScheduledInterviews: function (onComplete) {

                    $.ajax({
                        type: "GET",
                        contentType: 'application/json',
                        dataType: "json",
                        url: constants.urls.getTimeSlots + "?uid=" + constants.interview.user + '&uiid=' + constants.interview.ui + '&cliid=' + constants.interview.client,
                        success: function (data) {
                            onComplete(data[0][0]);
                        },
                        error: function (xhr, ajaxOptions, error) {
                            console.log(xhr);
                        }
                    });
                },
                getUnscheduledInterviews: function (onComplete) {
                    var elid = "dynamic-content-loader";
                    adri.ui.loader(true, elid);
                    var posFilter = $('#unsch-position-filter').val() || 'All';
                    $.ajax({
                        type: "GET",
                        contentType: 'application/json',
                        dataType: "json",
                        url: constants.urls.getUnscheduledInterviews + '?uid=' + constants.interview.user + '&uiid=' + constants.interview.ui + '&cliid=' + constants.interview.client + '&pfl=' + btoa(posFilter),
                        success: function (data) {
                            onComplete(data[0]);
                            adri.ui.loader(false, "dynamic-content-loader");
                        },
                        error: function (xhr, ajaxOptions, error) {
                            console.log(xhr);
                        }
                    });
                },
                getInterviewsDate: function (date, onComplete) {

                    var posFilter = $('#sch-position-filter').val() || 'All';

                    $.ajax({
                        type: "GET",
                        contentType: 'application/json',
                        dataType: "json",
                        url: constants.urls.getInterviewsDate + "?uid=" + constants.interview.user + "&adate=" + btoa(date) + '&uiid=' + constants.interview.ui + '&cliid=' + constants.interview.client + '&pfl=' + btoa(posFilter),
                        success: function (data) {
                            console.log(data);
                            onComplete(data[0]);
                        },
                        error: function (xhr, ajaxOptions, error) {
                            console.log(xhr);
                        }
                    });
                },
                getPositions: function (onComplete) {
                    $.ajax({
                        type: "GET",
                        contentType: 'application/json',
                        dataType: "json",
                        url: constants.urls.getPositions + '?uid=' + constants.interview.user + '&uiid=' + constants.interview.ui + '&cliid=' + constants.interview.client,
                        success: function (data) {
                            onComplete(data[0]);
                        },
                        error: function (xhr, ajaxOptions, error) {
                            console.log(xhr);
                        }
                    });
                },
                setPositionFilters: function (data) {
                    var $sch = $('#sch-position-filter');
                    var $unsch = $('#unsch-position-filter');
                    var lim = data.length;
                    $sch.html('<option value="All">All</option>');
                    $unsch.html('<option value="All">All</option>');
                    var map = {};
                    for (var i = 0; i < lim; i++) {
                        if (!map[data[i].POSITION_NAME]) {
                            map[data[i].POSITION_NAME] = data[i].POSITION_NAME;
                            $sch.append('<option value="' + data[i].POSITION_NAME + '">' + data[i].POSITION_NAME + '</option>');
                            $unsch.append('<option value="' + data[i].POSITION_NAME + '">' + data[i].POSITION_NAME + '</option>');
                        }
                    }

                },
                drawInterviewsForDate: function (data) { //MARK: modified to be very similar to drawSInterviews. Change is mainly to make the header perform differently when selecting a specific date. 

                    var lim = data.length;
                    var $schArea = $('#interviews');
                    $schArea.html('<div id="interviews-table" class="ui-table spanned"></div>');

                    var $tab = $('#interviews-table');

                    var row = '<div class="ui-row-header">' +
                        '<div class="ui-cell-med roboto ui-cell-pad left ">Call Time <span class="block">(Click for more details)</span></div>' +
                        '<div class="ui-cell-med roboto left">Prospect</div>' +
                        '<div class="ui-cell-med roboto left">Position</div>' +
                        '<div class="ui-cell-sm roboto ui-cell-pad left">Req</div>' +
                        '<div class="ui-cell-sm roboto left">Phone</div>' +
                        '<div class="ui-cell-med roboto left">Email</div>' +
                        '</div>';
                    $tab.append(row);

                    var lim = data.length;

                    var dtlBar = '';
                    var canName = '';
                    var tslot = '';
                    var phone = '';
                    var rowColors = adri.colors;

                    for (var i = 0; i < lim; i++) {
                        var getRandomColor = rowColors[Math.floor(Math.random() * rowColors.length)];
                        var rowID = 'rowNum' + i;

                        if (data[i]['CANDIDATE_ID'] !== null) {
                            canName = data[i]['FULL_NAME']
                        }
                        else {
                            canName = 'TBD';
                        }

                        if (data[i]['TIME_SLOT'] !== undefined) {
                            tslot = data[i]['CLEAN_DATE'];
                        }
                        else {
                            tslot = 'TBD';
                        }

                        phone = data[i]['CANDIDATE_PHONE'] || '';

                        if (phone === null) {
                            phone = '';
                        }
                        dtlBar = '<div class="ui-cell-med roboto ui-cell-pad small"> ' + tslot + '</div>' +
                            '<div class="ui-cell-med roboto small"> ' + canName + '</div>' +
                            '<div class="ui-cell-med roboto small"> ' + data[i]['POSITION_NAME'] + '</div>' +
                            '<div class="ui-cell-sm ui-cell-pad roboto small"> ' + data[i]['POSITION_ID'] + '</div>' +
                            '<div class="ui-cell-sm roboto small"> ' + phone.toPhone() + '</div>' +
                            '<div class="ui-cell-med roboto small"> ' + data[i]['CANDIDATE_EMAIL'] + '</div>';
                        $tab.append('<div class="ui-row-spacer-main"></div><div onclick="adri.ui.dashboard.getInterview(\'' + data[i]['INTERVIEW_REFERENCE_ID'] + '\');" id="' + rowID + '" class="ui-main-row-inert tableBG">' + dtlBar + '</div>');

                        $('#' + rowID).css('border-left', '5px solid ' + getRandomColor);
                    }

                    $('.selAll').on('click', function () {
                        $(this).select();
                    });
                    var elid = "dynamic-content-loader";
                    adri.ui.loader(false, elid);
                },
                drawUnscheduledInterviews: function (data) {

                    var toggle = function () {
                        adri.ui.dashboard.filter.scheduled();
                    };
                    var htxt = 'Unscheduled Prospects';

                    $('#sch-selected-date').text(htxt);

                    $('#toggleScheduled').html('<div title="Check your scheduled prospects">Scheduled Prospects</div>');
                    $('#toggleScheduled').removeAttr('onclick');
                    $('#toggleScheduled').attr('onclick', 'adri.ui.dashboard.getInterviews(' + toggle + ')');

                    var lim = data.length;
                    var $schArea = $('#interviews');

                    $schArea.html('<div id="interviews-table" class="ui-table spanned"></div>');

                    var $tab = $('#interviews-table');

                    var row = '<div class="ui-row-header">' +
                        '<div class="ui-cell-btn-header roboto left">Delete</div>' +
                        '<div class="ui-cell-med roboto ui-cell-pad left ">Call Time <span class="block">(Click for more details)</span></div>' +
                        '<div class="ui-cell-med roboto left">Prospect</div>' +
                        '<div class="ui-cell-med roboto left">Position</div>' +
                        '<div class="ui-cell-sm roboto ui-cell-pad left">Req</div>' +
                        '<div class="ui-cell-sm roboto left">Phone</div>' +
                        '<div class="ui-cell-med roboto left">Email</div>' +
                        '</div>';
                    $tab.append(row);

                    var lim = data.length;

                    var dtlBar = '';
                    var canName = '';
                    var tslot = '';
                    var phone = '';
                    var rowColors = adri.colors;

                    for (var i = 0; i < lim; i++) {
                        var getRandomColor = rowColors[Math.floor(Math.random() * rowColors.length)];
                        var rowID = 'rowNum' + i;

                        if (data[i]['CANDIDATE_ID'] !== null) {
                            canName = data[i]['FULL_NAME']
                        }
                        else {
                            canName = 'TBD';
                        }

                        if (data[i]['TIME_SLOT'] !== null) {
                            tslot = data[i]['CLEAN_DATE'];
                        }
                        else {
                            tslot = 'TBD';
                        }

                        phone = data[i]['CANDIDATE_PHONE'] || '';

                        if (phone === null) {
                            phone = '';
                        } //&#xE5CD;
                        dtlBar = '<div class="ui-cell-btn left" onclick="adri.ui.dashboard.deleteUser(\'' + data[i]['ROW_ID'] + '\',\'' + data[i]['INTERVIEW_REFERENCE_ID'] + '\');">&#xE5CD;</div>' +
                            '<div class="ui-cell-med roboto ui-cell-pad small"> ' + tslot + '</div>' +
                            '<div class="ui-cell-med roboto small"> ' + canName + '</div>' +
                            '<div class="ui-cell-med roboto small"> ' + data[i]['POSITION_NAME'] + '</div>' +
                            '<div class="ui-cell-sm ui-cell-pad roboto small"> ' + data[i]['POSITION_ID'] + '</div>' +
                            '<div class="ui-cell-sm roboto small"> ' + phone.toPhone() + '</div>' +
                            '<div class="ui-cell-med roboto small"> ' + data[i]['CANDIDATE_EMAIL'] + '</div>';
                        $tab.append('<div class="ui-row-spacer-main"></div><div onclick="adri.ui.dashboard.getInterview(\'' + data[i]['INTERVIEW_REFERENCE_ID'] + '\');" id="' + rowID + '" class="ui-main-row-inert tableBG">' + dtlBar + '</div>');

                        $('#' + rowID).css('border-left', '5px solid ' + getRandomColor);
                    }

                    $('.selAll').on('click', function () {
                        $(this).select();
                    });
                    var elid = "dynamic-content-loader";
                    adri.ui.loader(false, elid);
                },
                drawInterviews: function (data) {
                    /*
                    var toggle = function (data) {
                        adri.ui.dashboard.drawUnscheduledInterviews(data);
                    };
                    var htxt = 'All Scheduled Calls';

                    $('#sch-selected-date').text(htxt);
                    //$('#toggleScheduled').text('Unscheduled Prospects');
                    $('#toggleScheduled').html('<div title="Check your unscheduled prospects">Unscheduled Prospects</div>');
                    $('#toggleScheduled').removeAttr('onclick');
                    $('#toggleScheduled').attr('onclick', 'adri.ui.dashboard.getUnscheduledInterviews(' + toggle + ')');
                    console.log(data);
                    var lim = data.length;
                    var $schArea = $('#interviews');
                    $schArea.html('<div id="interviews-table" class="ui-table spanned"></div>');

                    var $tab = $('#interviews-table');

                    var row = '<div class="ui-row-header">' +
                        '<div class="ui-cell-med roboto ui-cell-pad left ">Call Time <span class="block">(Click for more details)</span></div>' +
                        '<div class="ui-cell-med roboto left">Prospect</div>' +
                        '<div class="ui-cell-med roboto left">Position</div>' +
                        '<div class="ui-cell-sm roboto ui-cell-pad left">Req</div>' +
                        '<div class="ui-cell-sm roboto left">Phone</div>' +
                        '<div class="ui-cell-med roboto left">Email</div>' +
                        '</div>';
                    $tab.append(row);

                    var lim = data.length;

                    var dtlBar = '';
                    var canName = '';
                    var tslot = '';
                    var phone = '';
                    var rowColors = adri.colors;

                    for (var i = 0; i < lim; i++) {
                        var getRandomColor = rowColors[Math.floor(Math.random() * rowColors.length)];
                        var rowID = 'rowNum' + i;

                        if (data[i]['CANDIDATE_ID'] !== null) {
                            canName = data[i]['FULL_NAME']
                        }
                        else {
                            canName = 'TBD';
                        }

                        if (data[i]['TIME_SLOT'] !== undefined) {
                            tslot = data[i]['CLEAN_DATE'];
                        }
                        else {
                            tslot = 'TBD';
                        }

                        phone = data[i]['CANDIDATE_PHONE'] || '';

                        if (phone === null) {
                            phone = '';
                        }
                        dtlBar = '<div title="Click to view Call Details" class="ui-cell-med roboto ui-cell-pad small">' + tslot + '</div>' +
                            '<div title="Click to view Call Details" class="ui-cell-med roboto small">' + canName + '</div>' +
                            '<div title="Click to view Call Details" class="ui-cell-med roboto small">' + data[i]['POSITION_NAME'] + '</div>' +
                            '<div title="Click to view Call Details" class="ui-cell-sm ui-cell-pad roboto small">' + data[i]['POSITION_ID'] + '</div>' +
                            '<div title="Click to view Call Details" class="ui-cell-sm roboto small">' + phone.toPhone() + '</div>' +
                            '<div title="Click to view Call Details" class="ui-cell-med roboto small">' + data[i]['CANDIDATE_EMAIL'] + '</div>';
                        $tab.append('<div class="ui-row-spacer-main"></div><div onclick="adri.ui.dashboard.getInterview(\'' + data[i]['INTERVIEW_REFERENCE_ID'] + '\');" id="' + rowID + '" class="ui-main-row-inert tableBG">' + dtlBar + '</div>');

                        $('#' + rowID).css('border-left', '5px solid ' + getRandomColor);
                    }

                    $('.selAll').on('click', function () {
                        $(this).select();
                    });
                    */
                    var elid = "dynamic-content-loader";

                    adri.ui.loader(false, elid);
                },
                drawPositionPool: function (data) {
                    var lim = data.length;
                    var $schArea = $('#position-pool');

                    $schArea.html('<div id="interviews-table" class="ui-table spanned"></div>');
                    var $tab = $('#interviews-table');

                    var row = '<div class="ui-row-header">' +
                        '<div class="ui-cell-btn-header roboto left">Delete</div>' +
                        '<div class="ui-cell-sm roboto ui-cell-pad left ">Req #</div>' +
                        '<div class="ui-cell-med roboto left">Req Name</div>' +
                        '<div class="ui-cell-sm roboto left">Req Type</div>' +
                        '<div class="ui-cell-med roboto ui-cell-pad left">Req Link</div>' +
                        '</div>';
                    $tab.append(row);

                    var dtlBar = '';
                    var canName = '';
                    var tslot = '';
                    var phone = '';
                    var rowColors = adri.colors;

                    for (var i = 0; i < lim; i++) {
                        var getRandomColor = rowColors[Math.floor(Math.random() * rowColors.length)];
                        var rowID = 'rowNum' + i;
                        var link = window.location.href.split('rctrinfsys')[0] + 'candidate.html?rec=' + btoa(data[i]['POSITION_ID']) + '&uiid=' + constants.interview.ui + '&cliid=' + constants.interview.client;
                        //$schArea.append('<div onclick="adri.ui.dashboard.scheduleInterview(\'' + data[i]['POSITION_ID'] + '\');" class="pool-node mainBG negTxt ckable">' + data[i]['LONG_NAME'] + '</div>');
                        //row = row + '<div class="ui-row ckable" onclick="adri.ui.dashboard.getReqLink(\'' + btoa(data[i]['POSITION_ID']) + '\');">';
                        dtlBar = '<div class="ui-cell-btn left" onclick="adri.ui.dashboard.confirmRemoveReq(\'' + data[i]['POSITION_ID'] + '\');">&#xE5CD;</div>' +
                            '<div class="ui-cell-med roboto small">' + data[i]['POSITION_ID'] + '</div>' +
                            '<div class="ui-cell-med roboto small">' + data[i]['POSITION_NAME'] + '</div>' +
                            '<div class="ui-cell-med roboto small">' + data[i]['POSITION_TYPE'] + '</div>' +
                            '<div class="ui-cell-med roboto small"><input class="selAll spanned-field" value="' + link + '" readonly /></div>' +
                            '</div>';
                        $tab.append('<div class="ui-row-spacer-main"></div><div id="' + rowID + '" onclick="adri.ui.dashboard.scheduleInterview(\'' + data[i]['POSITION_ID'] + '\');" class="ui-main-row-inert tableBG">' + dtlBar + '</div>');
                        $('#' + rowID).css('border-left', '5px solid ' + getRandomColor);
                    }

                    $('.selAll').on('click', function () {
                        $(this).select();
                    });

                    var elid = "dynamic-content-loader";
                    adri.ui.loader(false, elid);
                },
                getReqLink: function (reqnum) {
                    var link = window.location.href.split('rctrinfsys')[0] + 'candidate.html?rec=' + reqnum + '&uiid=' + constants.interview.ui + '&cliid=' + constants.interview.client;
                    var markup = '<div class="repeaterField"><div class="formHeader centered">Requisition Link</div><input id="req-input" class="infoTxt repeaterField" value="' + link + '" readonly /></div>';
                    $('#smallModal').html(markup);
                    $('#req-input').on('click', function () {
                        $(this).select();
                    });
                    adri.ui.modal.small.open();
                },
                confirmRemoveReq: function (reqnum) {
                    var conf = confirm('Are you sure you want to remove yourself from requisition ' + reqnum + '?');
                    if (conf) {
                        adri.ui.dashboard.removeReq(reqnum);
                    }
                },
                removeReq: function (reqnum) {
                    var jsData = {
                        reqnum: btoa(reqnum),
                        clientID: constants.interview.client,
                        userID: constants.interview.user,
                        uiID: constants.interview.ui,
                        interviewID: constants.interview.id
                    };

                    $.ajax({
                        type: "POST",
                        contentType: 'application/json',
                        dataType: "json",
                        url: constants.urls.removeReq,
                        data: JSON.stringify(jsData),
                        success: function (data) {
                            adri.ui.settings.open();
                        },
                        error: function (xhr, ajaxOptions, error) {
                            console.log(xhr);
                        }
                    });
                },
                getInterview: function (id) {
                    var elid = "dynamic-content-loader";
                    adri.ui.loader(true, elid);
                    constants.interview.id = btoa(id);
                    adri.ui.initialize();
                },
                addPosition: function () {
                    adri.ui.addPositionForm();
                },
                scheduleInterview: function (positionID) {
                    adri.ui.scheduleInterviewForm(positionID);
                },
                addParty: function () {
                    adri.interview.addUserForm();
                },
                notifyParties: function () {

                },
                refreshPool: function () {
                    var db = adri.ui.dashboard;
                    adri.ui.modal.close();
                    adri.ui.settings.addPositions();
                    /*
                    db.getPositions(function (data) {
                        db.drawPositionPool(data);
                    });
                    */
                },
                refreshInterviews: function () {
                    adri.ui.selectedDate = adri.ui.selectedDate || '';
                    adri.ui.modal.close();
                    if (adri.ui.selectedDate !== '') {
                        adri.ui.dashboard.getInterviewsForDate(adri.ui.selectedDate);
                    }
                },
                reports: {
                    open: function () {
                        adri.ui.selected('dashboard-sub-icon1', 'control-sub-label-act');
                        var $Content = $('.ui-content-body')
                        var iCard = '<div id="db-weekly-view" class="centered dashMain-title">' +
                            '<div style="margin-left:0;" class="dashboard-header-block"><div class="dashboard-header-text">Interactions</div></div>' +
                            '</div>' +
                            '<div id="db-scheduling" class="dashboard-scheduling">' +
                            '<div id="scheduled-interviews-container" class="fullWidth-container ">' +
                            '<div id="position-pool"></div>' +
                            '</div>' +
                            '</div>';
                        $Content.html(iCard);
                    }
                },
            },
            slideshow: {
                initialize: function () {
                    adri.ui.slideshow.populate();
                    adri.ui.slideshow.run();
                },
                populate: function () {
                    var slides = '<div class="ss-slide active-slide"><div class="vCenter slideTxt"><div style="display:inline-block;width:50%;">Need help?</div><div style="display:inline-block;width:50%;">Click the &quot;?&quot; on the bottom right of your screen.</div></div></div>' +
                        '<div class="ss-slide"><div class="vCenter slideTxt"><div style="display:inline-block;width:50%;height:100%;"><br/>Need to remove a req?<br/><br/></div><div style="display:inline-block;width:50%;">1) Navigate to &quot;My Positions&quot;<br/><br/>2) Click the &quot;X&quot; next to the desired req number.</div></div></div>' +
                        '<div class="ss-slide"><div class="vCenter slideTxt">Be sure to double-check your spam folder if you feel like you are missing notifications!</div></div>';
                    $('#main-splash').html(slides);
                },
                advance: function () {
                    var $active = $('#main-splash .active-slide');
                    var $next = $active.next();
                    if ($next.length === 0) {
                        $next = $('#main-splash .ss-slide').first();
                    }
                    $next.addClass('active-slide');
                    window.setTimeout(function () {
                        $active.removeClass('active-slide');
                    }, 300);
                },
                run: function () {
                    setInterval(adri.ui.slideshow.advance, 8000);
                }
            },
            modal: {
                open: function () {
                    $('#modal-form').stop();
                    $('#modal-bg-overlay').stop();
                    $('#modal-bg-overlay').fadeIn(400, function () {
                        $('#modal-form').fadeIn(400);
                    });
                },
                close: function () {
                    $('#modal-form').stop();
                    $('#modal-bg-overlay').stop();
                    $('#modal-form').fadeOut(400, function () {
                        $('#modal-bg-overlay').fadeOut(400);
                    });
                },
                small: {
                    open: function () {
                        $('#small-modal-bg-overlay').stop();
                        $('#smallModal').stop();
                        $('#small-modal-bg-overlay').fadeIn(400, function () {
                            $('#smallModal').fadeIn(400);
                        });
                    },
                    close: function () {
                        $('#small-modal-bg-overlay').stop();
                        $('#smallModal').stop();
                        $('#smallModal').fadeOut(400, function () {
                            $('#small-modal-bg-overlay').fadeOut(400);
                        });
                    }
                },
                error: {//Mark: Added different modal markup for errors and important notifications. 
                    open: function (t) {
                        $('#small-modal-bg-overlay').stop();
                        $('#error-modal').stop();
                        $('#small-modal-bg-overlay').fadeIn(400, function () {
                            $('#error-modal').fadeIn(400);
                        });
                        $('#availError').append(t);
                    },
                    close: function () {
                        $('#small-modal-bg-overlay').stop();
                        $('#error-modal').stop();
                        $('#error-modal').fadeOut(400, function () {
                            $('#small-modal-bg-overlay').fadeOut(400);
                        });
                    }
                }
            },
            addPositionForm: function () {
                var $schArea = $('#position-pool');
                var field = adri.ui.template.field;
                var posFields = field.input('Position ID', 'positions', 'id') + '<br/>' +
                    field.input('Position Name', 'positions', 'name') + '<br/>' +
                    field.selectNew('Position Type', 'positions', 'type', ['Vacancy', 'Evergreen']); //TO-DO: un-hardcode this

                posFields = '<div class="smallForm"><div class="smallFormFields"><div class="formHeader">New Position</div>' + posFields + '</div></div>';
                $schArea.append(posFields);

            },
            scheduleInterviewForm: function (positionID) {
                adri.ui.form.resetData();
                adri.ui.form.data.positions[0] = {
                    id: positionID
                };
                var $modal = $('#modal-form');
                var field = adri.ui.template.field;
                var intFields = '<div id="new-event-form" class="form-event">' +
                    '<div class="formHeader">Enter ' + appconfig.alias.interview + ' Information</div>' +
                    field.input(appconfig.alias.interview + ' Title', 'interview', 'title') +
                    '<div style="display:none;">' + field.input(appconfig.alias.interview + ' ID', 'interview', 'id') + '</div>' +
                    //field.input(appconfig.alias.interview + ' Address', 'interview', 'address') +                             //hard-coded
                    //field.input(appconfig.alias.interview + ' City', 'interview', 'city') +                                   //hard-coded
                    //field.input(appconfig.alias.interview + ' State', 'interview', 'state') +                            //hard-coded
                    //field.input(appconfig.alias.interview + ' Zip', 'interview', 'zip') +                                //hard-coded
                    field.input('Phone/ Conference Number', 'interview', 'conferenceNumber') +
                    field.input('Conference ID', 'interview', 'conferenceID') +
                    field.input('Conference Code', 'interview', 'conferenceCode') +
                    '<hr/>' +
                    field.userRepeater(appconfig.alias.candidate, 'users', 'candidates') +
                    '<hr/>' +
                    field.userRepeater(appconfig.alias.recruiter, 'users', 'recruiters') +
                    '<hr/>' +
                    field.userRepeater(appconfig.alias.interviewer, 'users', 'interviewers') +
                    '</div>';

                intFields = intFields +
                    '<hr />' +
                    '<button class="bigButton mainBG negTxt ckable" onclick="adri.ui.form.submit(adri.ui.dashboard.refreshInterviews)">SUBMIT</button>';
                $modal.html(intFields);

                var dNow = new Date();
                var iid = dNow.getTime() + '-' + atob(constants.interview.user);
                $('#field-id').val(iid);
                $('#field-id').change();

                adri.ui.modal.open();
            },
            submitPosition: function (onComplete) {

                var jData = adri.ui.form.data.positions;
                jData.clientID = constants.interview.client;
                jData.userID = constants.interview.user;
                jData.uiID = constants.interview.ui;
                console.log(JSON.stringify(jData));
                $.ajax({
                    type: "POST",
                    contentType: 'application/json',
                    dataType: "json",
                    url: constants.urls.addPosition,
                    data: JSON.stringify(jData),
                    success: function (data) {
                        console.log(data);
                        adri.ui.form.resetData();
                        onComplete();
                    },
                    error: function (xhr, ajaxOptions, error) {
                        console.log(xhr);
                    }
                });
            },
            submitInterview: function () {
                adri.ui.form.submit();
            },
            accordion: function (id) {
                var accItem = document.getElementsByClassName();
                var accHeader = document.getElementsByClassName();

                accHeader[id].addEventListener('click', theToggle, false);

                function theToggle() {
                    var theClass = this.parentNode.className;
                    for (e = 0; e < accItem.length; e++) {
                        accItem[e].className = '';
                    }
                    if (theClass == '') {
                        this.parentNode.className = '';
                    }
                }
            },
            debug: function () {
                var $Content = $('#adri-ras-content');
                var b1 = '<button type="button" onclick="adri.interview.get()">Get ' + appconfig.alias.interview + ' Info</button>';
                var b2 = '<button type="button" onclick="adri.ui.time.load(\'adri-ras-content\')">Load Time Controls</button>';
                var b3 = '<button type="button" onclick="adri.ui.availability.load()">Get Availability</button>';
                var b4 = '<button type="button" onclick="adri.ui.form.newEvent()">Create Event</button>';
                var markup = '<div style="text-align:center;">' +
                    b1 +
                    b2 +
                    b3 +
                    b4 +
                    '</div>';
                $Content.html(markup);
            },
            setData: function (id, field, value) {
                adri.data[id][field] = value;
            },
            time: {
                load: function (elmt) {
                    adri.ui.form.data = {
                        userID: constants.interview.user,
                        interviewID: constants.interview.id,
                        clientID: constants.interview.client,
                        uiID: constants.interview.ui,
                        availability: []
                    };
                    var today = new Date();
                    var cctr = '<div id="adri-ras-calendar-control" style="height:45%;width:90%;margin:0 auto;"></div>'; //maybe add to css
                    $('#' + elmt).html(cctr);
                    adri.util.controls.calendar.draw('adri-ras-calendar-control', today.getMonth(), today.getFullYear());
                },
                loadNew: function (elmt) { //Mark: loadNew added instead of load. The calendar function needed to be modified. Changed style as well. Chain needs to be modified so that availabilityView id doesn't have to be here.
                    $('#' + elmt).html('');
                    adri.ui.form.data = {
                        userID: constants.interview.user,
                        interviewID: constants.interview.id,
                        clientID: constants.interview.client,
                        uiID: constants.interview.ui,
                        availability: []
                    };
                    var today = new Date();
                    var cctr = '<div id="ribbon-header" class="dashHeader centered roboto">ADRI</div><div id="adri-ras-calendar-control"></div>' +
                        '<div id="availabilityView" class="timeContainerSmall"></div>';
                    $('#' + elmt).html(cctr);
                    adri.util.controls.calendarSmall.draw('adri-ras-calendar-control', today.getMonth(), today.getFullYear());
                    adri.user.info.launchEditForm();
                },
                submit: function () {
                    var jData = adri.timeslot.wrap();
                    adri.timeslot.add(jData);
                },
                dateNode: {
                    add: function (date, element) {
                        var dtNode = adri.ui.template.dateNode(adri.ui.time.dateNode.count, date);
                        var schdate = new BlockDate(date);
                        schdate.userID = atob(constants.interview.user);
                        schdate.status = 'Proposed';
                        schdate.interviewID = constants.interview.id;
                        adri.ui.form.data.availability.push([schdate]);
                        $('#' + element).append(dtNode);
                        adri.data[adri.ui.time.dateNode.count] = new ADRITime(date, '12', '00', 'AM', 'Accepted');
                        adri.ui.time.dateNode.count++;
                    },
                    remove: function (id) {
                        var $nodeID = $('#datetime-node-' + id);
                        $nodeID.remove();
                    },
                    count: 0
                }
            },
            availability: {
                load: function () {
                    adri.ui.availability.get();
                },
                get: function (onComplete) {
                    var svc = constants.urls.getTimeSlots + '?iref=' + constants.interview.id + '&uid=' + constants.interview.user + '&uiid=' + constants.interview.ui + '&cliid=' + constants.interview.client;
                    $.ajax({
                        type: "GET",
                        contentType: 'application/json',
                        dataType: "json",
                        url: svc,
                        success: function (data) {
                            onComplete(data[0]);
                        },
                        error: function (xhr, ajaxOptions, error) {
                            console.log(xhr);
                        }
                    });
                },
                drawNodes: function (data) {
                    var lim = data.length;
                    var $Content = $('#adri-ras-timeNodes');
                    $Content.html('');
                    var map = {};
                    for (var i = 0; i < lim; i++) {
                        if (!map[data[i]['TIME_SLOT']]) {
                            map[data[i]['TIME_SLOT']] = data[i];
                            map[data[i]['TIME_SLOT']].users = [];
                        }

                        map[data[i]['TIME_SLOT']].users.push(data[i]['USER_FNAME'] + ' ' + data[i]['USER_LNAME']);
                    }

                    for (var time in map) {
                        $Content.append(adri.ui.template.availabilityNode(map[time]));
                    }
                },
                drawUserTimes: function (data) {
                    var lim = data.length;
                    var $user = '';
                    var map = {};

                    $('.user-date-node-struct').html('');

                    for (var i = 0; i < lim; i++) {
                        data['TIME_SLOT'] = data['TIME_SLOT'] || '';

                        if (data[i]['TIME_SLOT'] != '' && data[i]['TIME_SLOT'] != null) {
                            $user = $('#user-availability-' + data[i]['USER_ID']);

                            if (!map[data[i]['USER_ID']]) {
                                map[data[i]['USER_ID']] = data[i];
                                $user.html('');
                            }
                            $user.append(adri.ui.template.availabilityNodeSingle(data[i]));
                            if (data[i]['CANDIDATE_ID'] !== null) {
                                $('#user-availability-' + data[i]['CANDIDATE_ID']).append(adri.ui.template.availabilityNodeSingle(data[i]));
                            }
                        }
                    }

                }
            },
            template: {
                field: {
                    wrap: function (label, field) {
                        var markup = '<div class="repeaterField centered">' +
                            '<span class="fheader block">' + label + '</span>' +

                            field +
                            '</div>';
                        return markup;
                    },
                    wrapDay: function (label, field) { //MARK
                        var markup = '<div class="repeaterFieldSpanned">' +
                            '<span class="fheader block">' + label + '</span>' +

                            field +
                            '</div>';
                        return markup;
                    },
                    wrapSmall: function (field, id) {//Mark: Created due to markup change. label parameter is not needed as result. 
                        var markup = '<div class="time-block-repeater" >' +
                            '<div class="repeaterFieldSmall left">' +
                            field +
                            '</div>' +
                            '</div>';
                        return markup;
                    },
                    timeWrap: function (field, id) {//Mark: Created due to markup change. label parameter is not needed as result. 
                        var markup = '<div class="time-block-repeater" >' +
                            '<div class="repeaterFieldSmall left">' +
                            field +
                            '</div>' +
                            '</div>';
                        return markup;
                    },
                    toggler: function (label, icon, updates, field, value) {
                        var markup = '<div class="field-wrapper">' +
                            '<span class="secHTxt">' + label + '</span>' +
                            '<div class="field-toggler ckable" data-state="off" data-value="' + value + '" onclick="adri.ui.form.setToggler($(this)); adri.ui.form.setData(\'' + updates + '\',\'' + field + '\',$(this).attr(\'data-value\'));"><div>' + icon + '</div></div>' +
                            '</div>';
                        return markup;
                    },
                    groupToggle: function (icon, updates, field) {
                        var markup = '<div class="field-toggler ckable" data-state="off" data-value="no" onclick="adri.ui.form.setToggler($(this)); adri.ui.form.setData(\'' + updates + '\',\'' + field + '\',$(this).attr(\'data-value\'));"><div>' + icon + '</div></div>';
                        return markup;
                    },
                    dayToggleOld: function (icon, updates, index) {
                        var markup = '<div class="field-toggler ckable" id="day-toggle-' + index + '-' + updates + '" data-state="off" data-value="no" onclick="adri.ui.form.setToggler($(this)); adri.ui.form.instantiateDay(\'' + updates + '\',\'' + index + '\');"><div>' + icon + '</div></div>';
                        return markup;
                    },
                    dayToggle: function (icon, updates, index) {//MARK: altered dayToggle to work with new markup. 
                        var markup = '<div title="Choose the days you are available!" class="day-toggler" id="day-toggle-' + index + '-' + updates + '" data-state="off" data-value="no" onclick="adri.ui.form.setToggler($(this)); adri.ui.form.instantiateDay(\'' + updates + '\',\'' + index + '\');"><div>' + icon + '</div></div>';
                        return markup;
                    },
                    dayToggleSmall: function (icon, updates, index) { //MARK: added smaller dayToggle
                        var markup = '<div class="field-viewer" id="day-toggle-' + index + '-' + updates + '" data-state="off" data-value="no" adri.ui.form.instantiateDay(\'' + updates + '\',\'' + index + '\');"><div>' + icon + '</div></div>';
                        return markup;
                    },
                    selectNew: function (label, updates, field, choices) {
                        var lim = choices.length;
                        var opts = '';
                        for (var i = 0; i < lim; i++) {
                            opts = opts + '<option value="' + choices[i] + '">' + choices[i] + '</option>';
                        }

                        adri.ui.form.setData(updates, field, choices[0]);
                      
                        var markup = '<div class="field-wrapper">' +
                            '<span>' + label + '</span>' + 
                            '<div class="containerFull"><select class="" onchange="adri.ui.form.setData(\'' + updates + '\',\'' + field + '\',$(this).val());">' + opts + '</select></div>'
                        '</div>';
                        return markup;
                    },
                    select: function (label, updates, field, choices) {
                        var lim = choices.length;
                        var opts = '';
                        for (var i = 0; i < lim; i++) {
                            opts = opts + '<option value="' + choices[i] + '">' + choices[i] + '</option>';
                        }

                        adri.ui.form.setData(updates, field, choices[0]);

                        var markup = '<div class="field-wrapper">' +
                            '<span>' + label + '</span>' +
                            '<select onchange="adri.ui.form.setData(\'' + updates + '\',\'' + field + '\',$(this).val());">' + opts + '</select>' +
                            '</div>';
                        return markup;
                    },
                    input: function (label, updates, field, value) {
                        value = value || '';
                        var markup = '<div class="field-wrapper">' +
                            '<span>' + label + '</span>' +
                            '<input id="field-' + field + '" onchange="adri.ui.form.setData(\'' + updates + '\',\'' + field + '\',$(this).val());">' + value + '</input>' +
                            '</div>';
                        return markup;
                    },
                    number: function (label, updates, field, step, value, min) {
                        min = min || 0;
                        value = value || '';
                        step = step || '1';
                        var markup = '<div class="field-wrapper">' +
                            '<span>' + label + '</span>' +
                            '<input type="number" min="' + min + '" id="field-' + field + '" step="' + step + '" value="' + value + '" onchange="adri.util.checkNumValue($(this),' + min + ',' + step + ');adri.ui.form.setData(\'' + updates + '\',\'' + field + '\',$(this).val());"></input>' +
                            '</div>';
                        return markup;
                    },
                    userInput: function (label, role, index, field) {
                        var markup = '<div class="field-wrapper">' +
                            '<span>' + label + '</span>' +
                            '<input onchange="adri.ui.form.setUserData(\'' + role + '\',\'' + index + '\',\'' + field + '\',$(this).val());"></input>' +
                            '</div>';
                        return markup;
                    },
                    userRepeater: function (label, updates, field) {
                        var rid = label.split(/[^A-Za-z0-9]/).join('');
                        var markup = '<div title="Add a range of time. You can use this for more control of your schedule." id="user-repeater-' + rid + '"></div><button class="button thin hlBG negTxt ckable" onclick="adri.ui.form.addUser(\'user-repeater-' + rid + '\',\'' + label + '\',\'' + updates + '\',\'' + field + '\')"><span>Add ' + label + '</span></button>';
                        return markup;
                    },
                    user: function (role, updates, fld) {
                        var nodes = $('.form-user-node-struct').length;
                        adri.ui.form.data.users[fld][nodes] = {};
                        var field = adri.ui.template.field;
                        var markup = '<div id="user-' + nodes + '" class="form-user-node">' +
                            '<div id="user-' + nodes + '" class="formHeader">Enter ' + role + ' Information</div>' +
                            field.userInput(role + ' ID', fld, nodes, 'id') +
                            field.userInput(role + ' First Name', fld, nodes, 'firstName') +
                            field.userInput(role + ' Last Name', fld, nodes, 'lastName') +
                            field.userInput(role + ' Email', fld, nodes, 'email') +
                            field.userInput(role + ' Phone', fld, nodes, 'phone') +
                            '</div>';
                        return markup;
                    },
                    timeNodes: function (category, index) {
                        var zone;
                        var markup = '';
                        var mkup = '';
                        var timeData = adri.util.time.propagateWorkhoursArray();
                        var hours = timeData.hours;
                        var minutes = timeData.minutes;
                        var period = timeData.period;
                        var hrs = hours.length;
                        var mins = minutes.length;                  
                   
                        var hmkup = '';
                        for (var i = 0; i < hrs; i++) {
                            hmkup = hmkup + '<option value="' + hours[i] + '">' + hours[i][0] + '</option>';
                        }

                        var id = 'selector-hours' + index + '-' + category;      
                        adri.id = id;                                                                                                                                             ////onclick="adri.ui.form.setBlockTime(\'' + category + '\',\'' + index + '\',\'hour\',\'' + value[0] + '\'); adri.ui.form.setBlockTime(\'' + category + '\',\'' + index + '\',\'period\',\'' + value[1] + '\');"          
                        markup = '<div title="Use these fields to choose a time range for your availability" id="selector-hours-' + index + '-' + category + '" class="container"><select onchange="adri.ui.form.setBlockHour(\'' + category + '\',\'' + index + '\',\'hour\',$(this).val()); adri.ui.form.setBlockHour(\'' + category + '\',\'' + index + '\',\'period\',$(this).val());" class="dropdown" id="radio-hours-' + index + '-' + category + '" >' + hmkup + '</select></div>';
                        
                        for (var e = 0; e < mins; e++) {
                            mkup = mkup + '<option value="' + minutes[e] + '">' + minutes[e] + '</option>';
                        }

                        markup = markup + '<div title="Use these fields to choose a time range for your availability" class="container"><select onchange="adri.ui.form.setBlockMinute(\'' + category + '\',\'' + index + '\',\'hour\',\'' + minutes[0] + '\'); adri.ui.form.setBlockMinute(\'' + category + '\',\'' + index + '\',\'period\',\'' + minutes[1] + '\');" class="dropdown" div id="radio-minutes-' + index + '-' + category + '" >' + mkup + '</select></div>';

                        return markup;
                    },
                    timeNodesOld: function (category, index) {
                        var zone;
                        var markup = '';;
                        var timeData = adri.util.time.propagateWorkhoursArray();
                        var hours = timeData.hours;
                        var minutes = timeData.minutes;
                        var period = timeData.period;
                        var hrs = hours.length;
                        var mins = minutes.length;

                        var hmkup = '';
                        for (var h = 0; h < hrs; h++) {
                            hmkup = hmkup + adri.ui.template.field.workHourNode(category, index, 'radio-hours-' + index + '-' + category, hours[h]);
                        }

                        markup = '<div class="mobile-hscroll"><div id="radio-hours-' + index + '-' + category + '" class="timenodes"><div class="secHTxt">Hour</div><div>' + hmkup + '</div></div><div class="ampmGradient timenode-bar"></div></div>';

                        var mmkup = '';
                        for (var m = 0; m < mins; m++) {
                            mmkup = mmkup + adri.ui.template.field.timeNode(category, index, 'radio-minutes-' + index + '-' + category, minutes[m], minutes[m]);
                        }

                        markup = markup + '<div class="mobile-hscroll"><div id="radio-minutes-' + index + '-' + category + '" class="timenodes"><div class="secHTxt">Minute</div>' + mmkup + '</div></div>';

                        return markup;
                    },
                    workHourNodeOld: function (category, index, zone, value) {
                        var markup = '<div id="' + zone + '-' + index + '-' + value.join('') + '" class="field-toggler ckable radio" data-value="' + value[0] + '" onclick="adri.ui.form.setRadio(\'' + zone + '\',$(this)); adri.ui.form.setBlockTime(\'' + category + '\',\'' + index + '\',\'hour\',\'' + value[0] + '\'); adri.ui.form.setBlockTime(\'' + category + '\',\'' + index + '\',\'period\',\'' + value[1] + '\');"><div>' + value[0] + '</div></div>';
                        return markup;
                    },
                    workHourNode: function (category, index, zone, value) {
                        var markup = '<option id="' + zone + '-' + index + '-' + value.join('') + '" class="option" data-value="' + value[0] + '">' + value[0] + '</option>';
                        return markup;
                    },
                    timeNode: function (category, index, zone, value, icon) {
                        var markup = '<option id="' + zone + '-' + index + '-' + value + '" onclick="adri.ui.form.setBlockTime(\'' + category + '\',\'' + index + '\',\'minutes\',\'' + value + '\');">' + icon + '</option>';
                        return markup;
                    },
                    timeNodeSmall: function (category, index, zone, value, args) {//Mark: added "small" function as the timeNode function is still needed for the editing form. 
                        var icon = args['hr'] + ':' + args['min'] + args['per'];
                        var markup = '<div class="time-section"><div class="field-viewer" id="' + zone + '-' + index + '-' + value + '" >' + icon + '</div></div>';
                        return markup;
                    }
                },
                availabilityNode: function (data) {
                    var fields = [
                        'INTERVIEW_REFERENCE_ID',
                        'TIME_SLOT',
                        'TIME_SLOT_STATUS',
                        'TSID',
                        'USER_FNAME',
                        'USER_ID',
                        'USER_LNAME',
                        'USER_ROLE'
                    ];

                    data['TIME_SLOT'] = data['TIME_SLOT'] || '';

                    var nodeID = data['TIME_SLOT'].split(/[^0-9]/).join('-');
                    var markup = '<div id="availability-node-' + nodeID + '" class="date-node">' +
                        adri.ui.template.date(data['TIME_SLOT'].split('T')[0]) +
                        '<div>' + data['TIME_SLOT'].split('T')[1].split('Z')[0] + '</div>' +
                        '<div>' + data.users.join('\<br\/\>') + '</div>' +
                        '</div>';
                    return markup;

                },
                availabilityNodeSingle: function (data) {
                    var nodeID = data['TIME_SLOT'].split(/[^0-9]/).join('-');
                    var markup = '<div id="availability-node-' + nodeID + '" class="date-node-single">' +
                        adri.ui.template.date(data['TIME_SLOT'].split('T')[0]) +
                        '<div>' + data['TIME_SLOT'].split('T')[1].split('Z')[0] + '</div>' + //<i class="material-icons">&#xE5CD;</i>
                        '<div class="remove-widget" onclick="adri.timeslot.deleteSlot(\'' + data['TSID'] + '\');">&#xE5CD;</div>' +
                        '</div>';
                    return markup;
                },
                userNode: function (data) {
                    var fields = [
                        'INTERVIEW_REFERENCE_ID',
                        'USER_FNAME',
                        'USER_ID',
                        'USER_LNAME',
                        'USER_ROLE',
                        'USER_PHONE',
                        'USER_EMAIL',
                        'ROW_ID'
                    ];

                    var fullName = data['USER_FNAME'] + ' ' + data['USER_LNAME'];

                    var nodeID = data['USER_ID'];

                    if (data['USER_PHONE'] === null) {
                        data['USER_PHONE'] = '';
                    }

                    var uid = atob(constants.interview.user); //<i class="material-icons">&#xE5CD;</i>
                    var delUser = '<div title="Delete this user from this call." class="remove-widget" onclick="adri.interview.deleteUser(\'' + data['ROW_ID'] + '\');">&#xE5CD;</div>';
                    if (uid === data.USER_ID || appconfig.page.interviewdetail.controls.deleteuser === false) {
                        delUser = '';
                    }

                    var role = data['USER_ROLE'] || '';
                    if (role === null) {
                        role = '';
                    }

                    role = role.split('Interviewer').join(appconfig.alias.interviewer);
                    role = role.split('Candidate').join(appconfig.alias.candidate);
                    role = role.split('Recruiter').join(appconfig.alias.recruiter);
                    var etxt = '<p>Email sent!</p>';
                    var mtxt = '<p>Text sent!</p>';
                    var calwidget = '<div title="Offer a specific time." class="add-widget" onclick="adri.timeslot.addControls(\'modal-form\',\'' + data['USER_ID'] + '\',\'' + fullName + '\',\'' + data['USER_ROLE'] + '\');">&#xE878;</div>';
                    var emlwidget = '<div title="Email this user a new link." class="add-widget" onclick="adri.util.emailUser(\'' + data['USER_ID'] + '\');adri.ui.modal.error.open(\'' + etxt + '\');">&#xE0BE;</div>';
                    var smswidget = '<div title="Send a mobile text to this user." class="add-widget" onclick="adri.util.smsUser(\'' + data['USER_ID'] + '\');adri.ui.modal.error.open(\'' + mtxt + '\');">&#xE0D8;</div>';

                    if (appconfig.page.interviewdetail.controls.calendar !== true) {
                        calwidget = '';
                    }

                    if (appconfig.page.interviewdetail.controls.email !== true) {
                        emlwidget = '';
                    }

                    if (appconfig.page.interviewdetail.controls.sms !== true) {
                        smswidget = '';
                    }

                    var markup = '<div id="user-node-' + nodeID + '" class="ui-user-node">' +
                        delUser +
                        '<div class="ui-user-node-info">' +
                        '<div class="ui-user-node-header">' + fullName + '</div>' +
                        '<hr />' +
                        '<div class="ui-user-node-body">' + role + '</div>' +
                        '<div class="ui-user-node-body">' + data['USER_PHONE'] + '</div>' +
                        '<div class="ui-user-node-body">' + data['USER_EMAIL'] + '</div>' +
                        '<div id="user-availability-' + nodeID + '" class="user-date-node"></div>' +
                        '<div style="margin-top:10%;" class="spanned centered block">' +
                        calwidget +
                        emlwidget +
                        smswidget +
                        '</div>' +
                        '</div>' +
                        '</div>';
                    return markup;
                },
                addUserNode: function () {
                    return '<div onclick="adri.interview.addUserForm();" class="add-user-container"><div class="add-user-widget">&#xf234;</div></div>';
                },
                dateNode: function (nodeID, date) {
                    var field = adri.ui.template.field;
                    var index = $('.ti-schedule-node').length;
                    var startSelector = field.timeNodes('starttime', index);
                    var markup = '<div id="datetime-node-' + nodeID + '" class="ti-schedule-node pBG">' +
                        adri.ui.template.date(date) +
                        field.wrap('Start Time', startSelector) + '<br />' +
                        '</div>';
                    return markup;
                },
                timeSelect: function (id, opts, field) {
                    return '<select id="' + id + '" class="time-select" onchange="adri.ui.setData(\'' + id + '\',\'' + field + '\',$(this).val())">' + opts + '</select>';
                },
                date: function (date) {
                    var da = date.split('-');
                    var formattedDate = da[1] + '/' + da[2] + '/' + da[0];
                    var markup = '<span>' + formattedDate + ': </span>'; //fix this up
                    return markup;
                }
            },
            form: {
                data: {
                    clientID: constants.interview.client,
                    userID: constants.interview.user,
                    uiID: constants.interview.ui,
                    interview: {},
                    positions: {},
                    users: {
                        candidates: {},
                        recruiters: {},
                        interviewers: {}
                    },
                    availability: []
                },
                resetData: function () {
                    adri.ui.form.data = {
                        clientID: constants.interview.client,
                        userID: constants.interview.user,
                        uiID: constants.interview.ui,
                        interview: {},
                        positions: {},
                        users: {
                            candidates: {},
                            recruiters: {},
                            interviewers: {}
                        }
                    };
                },
                setData: function (updates, field, val) {
                    adri.ui.form.data[updates][field] = val;
                },
                setSubData: function (updates, field, subField, val) {
                    adri.ui.form.data[updates][field][subField] = val;
                },
                setBlockHour: function (category, index, field, value) {
                    var val = value.split(',');
                    var time = val[0];
                    var period = val[1];

                    console.log('setBlockTime', category, index, field, value);
                    var lim = adri.ui.form.data.availability[index].length;
                    for (var i = 0; i < lim; i++) {
                        adri.ui.form.data.availability[index][i].schedule[category]['period'] = period;
                    }

                    for (var i = 0; i < lim; i++) {
                        adri.ui.form.data.availability[index][i].schedule[category]['hour'] = time;
                    }

                },
                setBlockMinute: function (category, index, field, value) {
                    var lim = adri.ui.form.data.availability[index].length;
                    for (var i = 0; i < lim; i++) {
                        adri.ui.form.data.availability[index][i].schedule[category][field] = value;
                    }

                },
                instantiateDay: function (day, index) {

                    var $node = $('#day-toggle-' + index + '-' + day);
                    var state = $node.attr('data-state');

                    if (state === 'off') {
                        var lim = adri.ui.form.data.availability[index].length;
                        var ids = [];
                        for (var i = 0; i < lim; i++) {
                            if (adri.ui.form.data.availability[index][i].day === day) {
                                ids.push(i);
                            }
                        }

                        for (var n = ids.length - 1; n > -1; n--) {
                            adri.ui.form.data.availability[index].splice(ids[n], 1);
                        }
                    }
                    else {
                        var block = new BlockDay(day);
                        if (!adri.ui.form.data.availability[index]) {
                            adri.ui.form.data.availability.push([block]);
                        }
                        else {
                            block.schedule = adri.ui.form.data.availability[index][0].schedule;
                            adri.ui.form.data.availability[index].push(block);
                        }
                    }
                },
                setUserData: function (role, index, field, val) {
                    adri.ui.form.data.users[role][index][field] = val;
                },
                addUser: function (el, role, updates, field) {
                    var markup = adri.ui.template.field.user(role, updates, field);
                    $('#' + el).append(markup);
                },
                removeUser: function (id, updates) {

                },
                newEvent: function () {
                    var $content = $('#adri-ras-content');
                    var field = adri.ui.template.field;
                    var interview = adri.ui.form.data.interview;
                    var position = adri.ui.form.data.positions;
                    var users = adri.ui.form.data.users;
                    var form = '<div id="new-event-form" class="form-event">' +
                        '<div class="formHeader">Enter ' + appconfig.alias.interview + ' Information</div>' +        //hard-coded
                        field.input(appconfig.alias.interview + ' Title', 'interview', 'title') +                       //hard-coded
                        '<div style="display:none;">' + field.input(appconfig.alias.interview + ' ID', 'interview', 'id') + '</div>' +
                        //field.input(appconfig.alias.interview + ' Address', 'interview', 'address') +
                        //field.input(appconfig.alias.interview + ' City', 'interview', 'city') +
                        //field.input(appconfig.alias.interview + ' State', 'interview', 'state') +
                        //field.input(appconfig.alias.interview + ' Zip', 'interview', 'zip') +
                        field.input('Phone/ Conference Number', 'interview', 'conferenceNumber') +   //hard-coded
                        field.input('Conference ID', 'interview', 'conferenceID') +           //hard-coded
                        field.input('Conference Code', 'interview', 'conferenceCode') +       //hard-coded
                        '<hr/>' +
                        field.input('Position ID', 'positions', 'id') +
                        field.input('Position Name', 'positions', 'name') +
                        '<hr/>' +
                        field.userRepeater(appconfig.alias.candidate, 'users', 'candidates') +
                        '<hr/>' +
                        field.userRepeater(appconfig.alias.recruiter, 'users', 'recruiters') +
                        '<hr/>' +
                        field.userRepeater(appconfig.alias.interviewer, 'users', 'interviewers') +      //hard-coded
                        '</div>' +
                        '<div style="width:100%;text-align:center;"><button type="button" onclick="adri.ui.form.submit()">Create Event!</button></div>';
                    $content.html(form);

                    var dNow = new Date();
                    var iid = dNow.getTime() + '-' + atob(constants.interview.user);
                    $('#field-id').val(iid);
                    $('#field-id').change();
                },
                submit: function (onComplete) {

                    console.log(JSON.stringify(adri.ui.form.data));

                    $.ajax({
                        type: "POST",
                        contentType: 'application/json',
                        dataType: "json",
                        url: constants.urls.addInterview,
                        data: JSON.stringify(adri.ui.form.data),
                        success: function (data) {
                            adri.ui.form.resetData();

                            if (typeof onComplete === "function") {
                                onComplete();
                            }
                        },
                        error: function (xhr, ajaxOptions, error) {
                            console.log(xhr);
                        }
                    });
                },
                setToggler: function ($toggler) {
                    var state = $toggler.attr('data-state');
                    if (state === 'off') {
                        $toggler.attr('data-state', 'on');
                        $toggler.attr('data-value', 'yes');
                        $toggler.addClass('cked');
                    }
                    else {
                        $toggler.attr('data-state', 'off');
                        $toggler.attr('data-value', 'no');
                        $toggler.removeClass('cked');
                    }
                },
                setRadio: function (zone, $radio) {
                    $('#' + zone + ' .radio').removeClass('cked');
                    $radio.addClass('cked');
                }
            },
            loader: function (isLoading, id) {
                var element = '<div class="spinnerContainer"><div class="loader"></div></div>';
                var theEl = $('#' + id);

                if (isLoading === true) {
                    theEl.css('display', '');
                    theEl.html(element);
                    var spinner = $(".loader");

                    setTimeout(function () {
                        spinner.css('transform', 'rotate(216000deg)');
                    }, 100);

                }

                else {
                    adri.ui.labels.initLabels();
                    theEl.css('display', 'none');
                }
            }
        },
        interview: {
            scheduling: {
                userID: '',
                userName: '',
                userRole: ''
            },
            get: function (onComplete) {
                $.ajax({
                    type: "GET",
                    contentType: 'application/json',
                    dataType: "json",
                    url: constants.urls.getInterview + "?iref=" + constants.interview.id + '&uid=' + constants.interview.user + '&uiid=' + constants.interview.ui + '&cliid=' + constants.interview.client,
                    success: function (data) {
                        onComplete(data[0][0]);
                    },
                    error: function (xhr, ajaxOptions, error) {
                        console.log(xhr);
                    }
                });
            },
            loadToUI: function (data) {

                $('#page-title').html(appconfig.alias.interview + ' Details');
                var $el = $('#contentRibbon');
                $el.html('');
                var interview = data;

                var iFields = [
                    //['ID', 'INTERVIEW_REFERENCE_ID'], //hard-coded
                    ['Title', 'INTERVIEW_TITLE'],
                    //['Address', 'INTERVIEW_ADDRESS'], //hard-coded
                    //['City', 'INTERVIEW_CITY'],           //hard-coded
                    //['State', 'INTERVIEW_STATE'],         //hard-coded
                    //['Zip', 'INTERVIEW_ZIP'],             //hard-coded
                    ['Conference Number', 'INTERVIEW_CONFERENCE_NUMBER'],
                    ['Conference Code', 'INTERVIEW_CONFERENCE_CODE'],
                    ['Conference ID', 'INTERVIEW_CONFERENCE_ID']
                ];

                var iCard = '<div id="interview-info-container" class="int-info-container">' +
                    '<div id="dtl-' + interview['INTERVIEW_REFERENCE_ID'] + '" class="interviewInfo">' +
                    '<div id="dtl-txt-' + interview['INTERVIEW_REFERENCE_ID'] + '" class="interviewCardContents ">' +
                    '<div id="interview-info-header" class="formHeader secHTxt roboto">' + appconfig.alias.interview + ' for ' + interview['POSITION_NAME'] + '</div>' +  //hard-coded
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '<div class="interviewNodeArea ">' +
                    '<div class="formHeader secHTxt">Users Associated with ' + appconfig.alias.interview + '</div>' +    //hard-coded
                    '<div id="adri-ras-timeNodes"></div>' +
                    '</div>' +
                    '<div id="modal-form" class="modal-form"></div>' +
                    '<div id="smallModal" class="modal-small"></div>' +
                    '<div id="modal-bg-overlay" class="modal-overlay" onclick="adri.timeslot.removeControls();"></div>' +
                    '<div id="small-modal-bg-overlay" class="modal-overlay" onclick="adri.ui.modal.small.close();"></div>';

                $el.html(iCard);
                var tMarkup = '';
                for (var i = 0; i < iFields.length; i++) {

                    if (interview[iFields[i][1]] === null) {
                        interview[iFields[i][1]] = '';
                    }

                    tMarkup = '<div class="icardFldWrap">' +
                        '<div class="secHTxt roboto bold block">' + iFields[i][0] + '</div><div class="secHTxt roboto fixedHgt">' + interview[iFields[i][1]] + '</div>' +
                        '</div>';
                    $('#dtl-txt-' + interview['INTERVIEW_REFERENCE_ID']).append(tMarkup);
                }

                $('.dynamicContent').fadeIn('fast');
            },
            getUsers: function (onComplete) {
                var svc = constants.urls.getUsers + '?iref=' + constants.interview.id + '&uid=' + constants.interview.user + '&uiid=' + constants.interview.ui + '&cliid=' + constants.interview.client;
                $.ajax({
                    type: "GET",
                    contentType: 'application/json',
                    dataType: "json",
                    url: svc,
                    success: function (data) {
                        console.log(data);
                        onComplete(data[0]);
                    },
                    error: function (xhr, ajaxOptions, error) {
                        console.log(xhr);
                    }
                });

            },
            addUserNodes: function (data) {
                var lim = data.length;
                var $Content = $('.ui-content-body');
                $Content.html('');
                var header = '<div id="db-weekly-view" class="centered dashMain-title">' +
                    '<div style="margin-left:0;" class="dashboard-header-block"><div class="dashboard-header-text">Call Details</div></div>' +
                    '</div>';
                $Content.html(header);

                var modal = '<div id="error-modal" class="modal">' +
                    '<div id="availError" class="modal-content">' +
                    '<button id="closeModal" class="close-modal" onclick="adri.ui.modal.error.close();">&times;</button>' +
                    '</div>' +
                    '</div>';
                $Content.append(modal);

                var map = {};

                for (var i = 0; i < lim; i++) {
                    if (!map[data[i]['USER_ID']]) {
                        map[data[i]['USER_ID']] = data[i];
                    }
                }

                for (var user in map) {
                    $Content.append(adri.ui.template.userNode(map[user]));
                }

                var rowColors = adri.tcolors;
                var getRandomColor = rowColors[Math.floor(Math.random() * rowColors.length)];
                $('.user-date-node').css('background', getRandomColor);

                if (appconfig.page.interviewdetail.controls.adduser === true) {
                    $Content.append(adri.ui.template.addUserNode());
                }
                var elid = "dynamic-content-loader";
                adri.ui.loader(false, elid);
            },
            addUserForm: function () {
                adri.ui.form.resetData();
                var $modal = $('#modal-form');
                var field = adri.ui.template.field;
                var userFields = field.userRepeater(appconfig.alias.candidate, 'users', 'candidates') +
                    field.userRepeater(appconfig.alias.recruiter, 'users', 'recruiters') +
                    field.userRepeater(appconfig.alias.interviewer, 'users', 'interviewers') +    //hard-coded
                    '<hr \>' +
                    '<button class="bigButton mainBG negTxt ckable" onclick="adri.interview.submitUsers()">SUBMIT</button>';
                $modal.html(userFields);
                adri.ui.modal.open();
            },
            submitUsers: function () {
                adri.ui.form.data.interview.id = constants.interview.id;

                $.ajax({
                    type: "POST",
                    contentType: 'application/json',
                    dataType: "json",
                    url: constants.urls.addUsers,
                    data: JSON.stringify(adri.ui.form.data),
                    success: function (data) {
                        adri.ui.form.resetData();
                        adri.interview.getUsers(function (data) {
                            adri.interview.addUserNodes(data);
                            adri.ui.availability.get(function (data) {
                                adri.ui.availability.drawUserTimes(data);
                            });
                        });
                        adri.ui.modal.close();
                    },
                    error: function (xhr, ajaxOptions, error) {
                        console.log(xhr);
                    }
                });

            },
            deleteUser: function (id) {
                var jsData = {
                    id: id,
                    clientID: constants.interview.client,
                    userID: constants.interview.user,
                    uiID: constants.interview.ui,
                    interviewID: constants.interview.id
                };

                $.ajax({
                    type: "POST",
                    contentType: 'application/json',
                    dataType: "json",
                    url: constants.urls.deleteUser,
                    data: JSON.stringify(jsData),
                    success: function (data) {
                        adri.interview.getUsers(function (data) {
                            adri.interview.addUserNodes(data);
                            adri.ui.availability.get(function (data) {
                                adri.ui.availability.drawUserTimes(data);
                            });
                        });
                    },
                    error: function (xhr, ajaxOptions, error) {
                        console.log(xhr);
                    }
                });
            }
        },
        timeslot: {
            wrap: function () {
                var jsData = {
                    data: [],
                    info: {
                        uiID: constants.interview.ui,
                        userID: constants.interview.user,
                        clientID: constants.interview.client
                    }
                };
                var index = 0;
                var timeslot;

                var lim = adri.ui.form.data.availability.length;

                for (var i = 0; i < lim; i++) {
                    timeslot = adri.ui.form.data.availability[i][0];
                    jsData.data[index] = new APITimeInstance(timeslot);
                    index++;
                }

                return jsData;
            },
            add: function (jsData) {
                console.log(JSON.stringify(jsData));
                $.ajax({
                    type: "POST",
                    contentType: 'application/json',
                    dataType: "json",
                    url: constants.urls.addTimeSlot,
                    data: JSON.stringify(jsData),
                    success: function (data) {
                        adri.data = {};
                        adri.timeslot.removeControls();
                        adri.ui.availability.get(function (data) {
                            adri.ui.availability.drawUserTimes(data);
                        });
                    },
                    error: function (xhr, ajaxOptions, error) {
                        console.log(xhr);
                    }
                });
            },
            addControls: function (elmt, userID, userName, userRole) {
                adri.interview.scheduling = {
                    userID: userID,
                    userName: userName,
                    userRole: userRole
                };
                adri.ui.time.load(elmt);
                adri.ui.modal.open();
            },
            removeControls: function () {
                adri.interview.scheduling = {
                    userID: '',
                    userName: '',
                    userRole: ''
                };
                adri.ui.modal.close();
            },
            deleteSlot: function (id) {
                var jsData = {
                    id: id,
                    interviewID: constants.interview.id,
                    uiID: constants.interview.ui,
                    userID: constants.interview.user,
                    clientID: constants.interview.client
                };

                $.ajax({
                    type: "POST",
                    contentType: 'application/json',
                    dataType: "json",
                    url: constants.urls.deleteTimeSlot,
                    data: JSON.stringify(jsData),
                    success: function (data) {
                        adri.ui.availability.get(function (data) {
                            adri.ui.availability.drawUserTimes(data);
                        });
                    },
                    error: function (xhr, ajaxOptions, error) {
                        console.log(xhr);
                    }
                });
            }
        },
        user: {
            validate: function (onComplete) {
                var svc = constants.urls.validateUser + '?iref=' + constants.interview.id + '&uid=' + constants.interview.user + '&uiid=' + constants.interview.ui + '&cliid=' + constants.interview.client;

                $.ajax({
                    type: "GET",
                    contentType: 'application/json',
                    dataType: "json",
                    url: svc,
                    success: function (data) {
                        onComplete(data);
                    },
                    error: function (xhr, ajaxOptions, error) {
                        console.log(xhr);
                    }
                });
            },
            info: {
                launchEditForm: function () {
                    adri.user.info.edit(constants.interview.user);
                },
                edit: function (userID, check) {
                    var $vc = $('#availabilityView');
                    var $modal = $('#modal-form');
                    var form = adri.user.info.form(userID);
                    var view = adri.user.info.view();
                    $vc.html(view);
                    $modal.html(form);
                    adri.user.info.load(userID);
                },
                form: function (userID) {
                    var field = adri.ui.template.field;
                    var wdGroup = field.dayToggle('Su', 'sunday', 0) +
                        field.dayToggle('Mo', 'monday', 0) +
                        field.dayToggle('Tu', 'tuesday', 0) +
                        field.dayToggle('We', 'wednesday', 0) +
                        field.dayToggle('Th', 'thursday', 0) +
                        field.dayToggle('Fr', 'friday', 0) +
                        field.dayToggle('Sa', 'saturday', 0);

                    var startSelector = field.timeNodes('starttime', 0);
                    var endSelector = field.timeNodes('endtime', 0);
                    var lunchSelector = field.timeNodes('lunchstart', 0);

                    var form = '<div class="formContent">' +
                        '<div class="dashMain-title centered">' +
                        '<div class="dashboard-header-block">' +
                        '<div class="dashboard-header-text">Persistent Availability</div>' +
                        '</div>' +
                        '</div>' +
                        '<div id="block-schedule-area" class="block-container">' +
                        '<div id="block-repeater-edit centered" class="block-repeater">' +
                        field.wrapDay('Days Available', wdGroup) +
                        '<div class="repeaterFieldSpanned">' +
                        field.wrap('Start', startSelector) +
                        field.wrap('End', endSelector) +
                        field.wrap('Lunch', lunchSelector) +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '<div class="block-repeater-add">' +
                        '<div title="Add an additional range of time to your schedule." class="block-text fheader">&nbsp;Add Another Schedule</div><div class="stdWidget" onclick="adri.user.info.addBlockRepeater();">&#xE146;</div>' +
                        '</div>' +
                        field.number('Default ' + appconfig.alias.interview + ' Length (Minutes)', 'info', 'defaultInterviewMinutes', 5, 20, 10) +           //hard-coded
                        field.number(appconfig.alias.interviewer + ' Rank', 'info', 'ranking', 1, 1, 0) +
                        '<div class="centered spanned"><button type="button" class="bigButton mainBG negTxt ckable" onclick="adri.user.info.update(\'' + userID + '\',adri.user.info.updated)">Submit</button></div><div class="spacer"></div>' +
                        '</div>';
                    return form;
                },
                personalInfo: function (userID) {
                    var info = '<div class="formHeader secHTxt centered">Identifying Information</div>' +
                        field.input('First Name', 'info', 'fName') +
                        field.input('Last Name', 'info', 'lName') +
                        field.input('Email Address', 'info', 'email') +
                        field.input('Phone Number', 'info', 'phone') +
                        field.input('Location', 'info', 'location') +
                        '<button class="bigButton mainBG negTxt ckable" onclick="adri.user.info.update(\'' + userID + '\',adri.user.info.updated)">Submit</button>';
                    return info;
                },
                view: function () {//Mark: view created for display under mini calendar. Most markup not needed as it is mostly drawn depending on the data pulled. 
                    var field = adri.ui.template.field;
                    var form = '<div class="formContent">' +
                        '<div class="dashHeader">Current Availability</div>' +
                        '<div title="Edit Availability" id="block-schedule-view" class="block-container" onclick="adri.ui.modal.open();">' +
                        '</div>' +
                        '</div>' +
                        '</div>';
                    return form;
                },
                addBlockRepeater: function () { // MARK: Might need to create view version of block repeater
                    var index = $('.block-repeater').length;
                    var field = adri.ui.template.field;
                    var wdGroup = field.dayToggle('Su', 'sunday', index) +
                        field.dayToggle('Mo', 'monday', index) +
                        field.dayToggle('Tu', 'tuesday', index) +
                        field.dayToggle('We', 'wednesday', index) +
                        field.dayToggle('Th', 'thursday', index) +
                        field.dayToggle('Fr', 'friday', index) +
                        field.dayToggle('Sa', 'saturday', index);

                    var startSelector = field.timeNodes('starttime', index);
                    var endSelector = field.timeNodes('endtime', index);
                    var lunchSelector = field.timeNodes('lunchstart', index);
                    var block = '<div class="block-repeater">' +
                        field.wrapDay('Days Available', wdGroup) +
                        '<div class="repeaterFieldSpanned">' +
                        field.wrap('Start', startSelector) +
                        field.wrap('End', endSelector) +
                        field.wrap('Lunch', lunchSelector) +
                        '</div>' +
                        '</div>';
                    $('#block-schedule-area').append(block);
                    //dropdowns();
                },
                addBlockView: function () { // MARK: View function created to handle the dashboard preview of availability. (Cleanup.)
                    $('#block-schedule-view').html('');
                    var index = $('.block-repeater').length;

                    var field = adri.ui.template.field;
                    var fWrap;
                    var avail = adri.ui.form.data.availability;
                    var aLen = avail.length;
                    var rowColors = adri.colors;
                    console.log(adri.ui.form.data);
                    if (avail[0]) {
                        var wkDays = {
                            'sunday': 'Su',
                            'monday': 'Mo',
                            'tuesday': 'Tu',
                            'wednesday': 'We',
                            'thursday': 'Th',
                            'friday': 'Fr',
                            'saturday': 'Sa'
                        };
                        var pMap = [
                            'endtime',
                            'lunchstart',
                            'starttime'
                        ];

                        function setTimeNode(t, tInstance, field, id) {
                            
                            var temp = adri.ui.template.field;
                            var h = tInstance.hour;
                            var m = tInstance.minutes;
                            var p = tInstance.period;
                            var tm;
                            var args = {
                                'hr': h,
                                'min': m,
                                'per': p
                            };

                            if (field === 'lunchstart') {

                            }
                            else {
                                if (field === 'starttime') {
                                    args.per = p + ' -';
                                    var hWrap = temp.timeNodeSmall(field, t, '#radio-hours-' + t + '-' + field + '-' + t + '-' + h, h, args);

                                    $('#' + id).append(temp.timeWrap(hWrap));
                                }
                                else {
                                    var hWrap = temp.timeNodeSmall(field, t, '#radio-hours-' + t + '-' + field + '-' + t + '-' + h, h, args);

                                    $('#' + id).append(temp.timeWrap(hWrap));
                                }
                            }
                        }

                        for (var e = 0; e < aLen; e++) {

                            var getRandomColor = rowColors[Math.floor(Math.random() * rowColors.length)];
                            var id = 'view' + e;
                            var dayID = 'day' + e;
                            var timeID = 'time' + e;
                            var block = '<div id="' + id + '" class="repeater-section">' +
                                '<div id="' + dayID + '" class="day-section"></div>' +
                                '<div id="' + timeID + '" class="time-section right"></div>' +
                                '</div>';
                            $('#block-schedule-view').append(block);
                            $('#' + id).css('border-left', '5px solid ' + getRandomColor);

                            for (var c = 0; c < avail[e].length; c++) {

                                var data = avail[e][c];
                                var dLen = data.length;
                                var day = data.day;
                                if (avail[e][(c + 1)] !== undefined) {
                                    var wkDay = wkDays[day] + ',';
                                }
                                else {
                                    var wkDay = wkDays[day];
                                }

                                var wdGroup = field.dayToggleSmall(wkDay, day, e);
                                var fWrap = field.wrapSmall(wdGroup, e);

                                $('#' + dayID).append(fWrap);
                            }
                            console.log(avail);
                            var sched = avail[e];
                            for (var i = 0; i < sched.length; i++) {
                                console.log(sched[i]);
                                setTimeNode(e, sched[i].schedule.starttime, 'starttime', timeID);
                                setTimeNode(e, sched[i].schedule.endtime, 'endtime', timeID);
                                setTimeNode(e, sched[i].schedule.lunchstart, 'lunchstart', timeID);
                            }

                        }
                    }
                    else {
                        var id = 'view';
                        var txt = '<p>Your availability needs to be set. Click "Edit Availability" to begin.</p>';
                        var block = '<div id="' + id + '" style="text-align:left; color:white; padding:4px; font-size:14pt;" class="repeater-section">Your availability is not set up.</div>';

                        $('#block-schedule-view').append(block);
                        adri.ui.modal.error.open(txt);
                    }
                },
                load: function (userID) {
                    adri.user.info.get(userID, function (data) {
                        adri.user.info.set(data);
                    });
                },
                get: function (userID, onComplete) {

                    userID = constants.interview.user;
                    var socket = io.connect('http://ec2-54-244-71-87.us-west-2.compute.amazonaws.com/');
                    socket.on('connect', function (data) {
                        socket.emit('getAvail', userID);
                    });

                    socket.on('recieveGet', function (data) {
                        onComplete(data);
                    });
                },
                set: function (data) { // MARK: modified the set to include the dashboard availability invocation. 
                    console.log(data[0]);
                    var pa = data[0];
                    //var uInfo = data.userInfo[0][0];

                    adri.ui.form.data = {
                        userID: btoa(pa.personid),
                        interviewID: constants.interview.id,
                        clientID: constants.interview.client,
                        interview: {},
                        positions: {},
                        uiID: constants.interview.ui,
                        info: {
                            id: btoa(pa.personid),
                            fName: '',
                            lName: '',
                            email: '',
                            phone: '',
                            location: '',
                            defaultInterviewMinutes: '20',
                            ranking: '1'
                        },
                        availability: []
                    };

                    var flds = [
                        ['fName', 'USER_FNAME'],
                        ['lName', 'USER_LNAME'],
                        ['email', 'USER_EMAIL'],
                        ['phone', 'USER_PHONE'],
                        ['location', 'LOCATION'],
                        ['defaultInterviewMinutes', 'DEFAULT_INTERVIEW_LENGTH'],
                        ['ranking', 'INTERVIEW_RANK']
                    ];

                    var lim = flds.length;
                    /*
                    for (var i = 0; i < lim; i++) {
                        $('#field-' + flds[i][0]).val(uInfo[flds[i][1]]);
                        adri.ui.form.data.info[flds[i][0]] = uInfo[flds[i][1]];
                    }
                    */
                    var dlm = adri.ui.form.data.info.defaultInterviewMinutes;

                    if (dlm === '' || dlm === null) {
                        adri.ui.form.data.info.defaultInterviewMinutes = 20;
                        $('#field-defaultInterviewMinutes').val(20);
                    }

                    function timeConvert(ts) {
                        var tps = ts.split('\:');
                        if (tps[0] == '12') {
                            tps[0] = '12PM'
                        }
                        else if (+tps[0] > 12) {
                            tps[0] = (+tps[0] - 12) + 'PM';
                        }
                        else {
                            tps[0] = +tps[0] + 'AM';
                        }

                        var o = {
                            hour: tps[0],
                            minute: tps[1]
                        };
                        return o;
                    }

                    function setTimeNode(t, tInstance, field) {
                        var h;
                        var m;
                        var p;
                        var tm;
                        tm = timeConvert(tInstance);
                        h = tm.hour;
                        m = tm.minute;

                        var $hr = $('#radio-hours-' + t + '-' + field + '-' + t + '-' + h);
                        var $min = $('#radio-minutes-' + t + '-' + field + '-' + t + '-' + m);

                        $hr.click();
                        $min.click();
                        $hr.attr('selected', true);
                        $min.attr('selected', true);
                    }

                    var tLim = pa.length;
                    var tMap = {};
                    var dateKey = '';
                    var cIndex = 0;
                    for (var n = 0; n < tLim; n++) {
                        dateKey = pa[n].starttime + '-' + pa[n].endtime + '-' + pa[n].lunchstart;
                        if (typeof tMap[dateKey] === 'undefined') {

                            if (n !== 0) {
                                adri.user.info.addBlockRepeater();
                            }
                            cIndex = adri.ui.form.data.availability.length;
                            tMap[dateKey] = cIndex;
                            $('#day-toggle-' + cIndex + '-' + pa[n].weekday.toLowerCase()).click();

                            setTimeNode(cIndex, pa[n].starttime, 'starttime');
                            setTimeNode(cIndex, pa[n].endtime, 'endtime');
                            setTimeNode(cIndex, pa[n].lunchstart, 'lunchstart');
                        }
                        else {
                            cIndex = tMap[dateKey];
                            $('#day-toggle-' + cIndex + '-' + pa[n].weekday.toLowerCase()).click();
                        }
                    }
                    adri.user.info.addBlockView();
                

                },
                update: function (userID, onComplete) {
                    var socket = io.connect('http://ec2-54-244-71-87.us-west-2.compute.amazonaws.com/');
                    adri.ui.loader(true, "dynamic-content-loader");
                    //var jData = adri.user.info.setJson();      
                    console.log('userID', userID);
                    var jData = adri.ui.form.data;
                    console.log(jData);
                    socket.on('connect', function (data) {
                        reconnection: false;
                        socket.emit('setAvail', jData, userID);
                        onComplete();
                    });

                },
                updated: function () { //Mark: added loadNew to refresh dash availability view along with loading animation close. 
                    var elid = "dynamic-content-loader";

                    adri.ui.form.resetData();
                    adri.ui.time.loadNew('contentRibbon');
                    adri.ui.loader(false, elid);
                    adri.ui.modal.close();
                },
                setJson: function () {
                    var jData = adri.ui.form.data;
                    return JSON.stringify(jData);
                }
            }
        },
        util: {
            checkNumValue: function ($el, min, step) {
                var vl = $el.val();

                step = step || 1;
                if (step > 1) {
                    vl = step * Math.round(vl / step);
                    $el.val(vl);
                }

                $el.val(Math.max(min, vl));

            },
            emailUser: function (userID) {
                var data = {
                    interviewID: constants.interview.id,
                    userID: btoa(userID),
                    type: btoa('email'),
                    clientID: constants.interview.client,
                    uiID: constants.interview.ui
                };

                $.ajax({
                    type: "POST",
                    contentType: 'application/json',
                    dataType: "json",
                    url: constants.urls.notifyUser,
                    data: JSON.stringify(data),
                    success: function (data) {

                    },
                    error: function (xhr, ajaxOptions, error) {
                        console.log(xhr);
                    }
                });
            },
            smsUser: function (userID) {
                var data = {
                    interviewID: constants.interview.id,
                    userID: btoa(userID),
                    type: btoa('sms'),
                    clientID: constants.interview.client,
                    uiID: constants.interview.ui
                };
                $.ajax({
                    type: "POST",
                    contentType: 'application/json',
                    dataType: "json",
                    url: constants.urls.notifyUser,
                    data: JSON.stringify(data),
                    success: function (data) {

                    },
                    error: function (xhr, ajaxOptions, error) {
                        console.log(xhr);
                    }
                });
            },
            getURLParams: function () {
                var uParts = window.location.href.split('?');
                var pObj = {};
                if (uParts.length > 1) {
                    var paramString = uParts[1];
                    var params = paramString.split('\&');
                    var pInfo;
                    for (var i = 0; i < params.length; i++) {
                        pInfo = params[i].split(/=(.+)/);
                        pInfo.push('');
                        pObj[pInfo[0]] = pInfo[1];
                    }

                    var ui = location.href.substring(0, location.href.lastIndexOf("/") + 1);
                    ui = btoa(ui);
                    constants.interview.id = pObj.iref;
                    constants.interview.user = pObj.uid;
                    constants.interview.ui = ui;
                    constants.interview.client = pObj.cliid;
                }
            },
            testFormat: function () {
                var frmt = $('#test-format').val();
                var args = { format: frmt }
                var rtv = adri.util.date.fmt(args);
                $('#test-format-out').html(rtv);
            },
            str: {
                pad: function (str, character, len, direction) {
                    len = len || 0;
                    len = len - str.length;
                    if (len < str.length) {
                        len = 0;
                    }
                    var d = direction || 'left';
                    d = d.toLowerCase();
                    var fString = '';
                    var padding = {
                        'left': function () {
                            for (var i = 0; i < len; i++) {
                                fString = '' + fString + character;
                            }
                            fString = '' + fString + str;
                        },
                        'right': function () {
                            fString = '' + str;
                            for (var i = 0; i < len; i++) {
                                fString = '' + fString + character;
                            }
                        }
                    };
                    padding[d]();
                    return fString;
                }
            },
            table: {
                headerCell: function (data) {
                    return '<div class="ui-header-cell">' + data + '</div>';
                },
                headerRow: function (data) {
                    var lim = data.length;
                    var cells = '';
                    for (var i = 0; i < lim; i++) {
                        cells = cells + adri.util.table.headerCell(data[i]);
                    }
                    return '<div class="ui-header-row">' + cells + '</div>';
                },
                dataCell: function (data) {
                    return '<div class="ui-cell">' + data + '</div>';
                },
                indicatorCell: function (data) {
                    //not currently used
                    return '<div class="ui-cell"><div class="indicator-cell"></div></div>';
                },
                dataRow: function (data, fields, id) {
                    var flds = fields.length;
                    var cells = '';
                    for (var i = 0; i < flds; i++) {
                        if (fields[i][1] == 'value') {
                            cells = cells + adri.util.table.dataCell(data[fields[i][0]]);
                        }
                        else {
                            cells = cells + adri.util.table.indicatorCell(data[fields[i][0]]);
                        }
                    }
                    return '<div class="ui-row" onclick="adri.ui.dashboard.getInterview(\'' + id + '\')">' + cells + '</div>';
                },
                dataRows: function (data, fields) {
                    var rows = '';
                    for (var row in data) {
                        rows = rows + adri.util.table.dataRow(data[row], fields, data[row][fields[0][0]]);
                    }
                    return rows;
                },
                body: function (rows) {
                    return '<div class="spacer"></div><div class="ui-table">' + rows + '</div><div class="spacer"></div>';
                }
            },
            date: {
                propagate: function (minDate, maxDate) {
                    //returns all dates between min and max date
                    var min = minDate.getDate() - 1;
                    var max = maxDate.getDate();
                    var dates = '';
                    var d;
                    var y = minDate.getFullYear();
                    var m = minDate.getMonth();
                    var dates = [];

                    for (var i = min; i < max; i++) {
                        d = new Date(y, m, min + i);
                        dates.push(d);
                    }

                    return dates;
                },
                fmt: function (args) {
                    var format = args.format || 'MM/dd/yyyy';
                    var dt = args.date || new Date();
                    var mth = '' + dt.getMonth();
                    var day = '' + dt.getDate();
                    var year = '' + dt.getFullYear();
                    var hrs = '' + dt.getHours();
                    var min = '' + dt.getMinutes();
                    var sec = '' + dt.getSeconds();
                    var wkdy = '' + dt.getDay();
                    var util = adri.util;

                    var patterns = [
                        { pattern: 'dd', out: util.str.pad(day, '0', 2) },
                        { pattern: 'd', out: day },
                        { pattern: 'DDDD', out: util.date.days[wkdy].name },
                        { pattern: 'DDD', out: util.date.days[wkdy].abbreviation },
                        { pattern: 'DD', out: util.str.pad(util.date.days[wkdy].number, '0', 2) },
                        { pattern: 'D', out: util.date.days[wkdy].number },
                        { pattern: 'MMMM', out: util.date.months[mth].name },
                        { pattern: 'MMM', out: util.date.months[mth].abbreviation },
                        { pattern: 'MM', out: util.str.pad(util.date.months[mth].number, '0', 2) },
                        { pattern: 'M', out: util.date.months[mth].number },
                        { pattern: 'yyyy', out: year },
                        { pattern: 'yy', out: year.slice(-2) },
                        { pattern: 'hh', out: util.str.pad(hrs, '0', 2) },
                        { pattern: 'h', out: hrs },
                        { pattern: 'mm', out: util.str.pad(min, '0', 2) },
                        { pattern: 'm', out: min },
                        { pattern: 'ss', out: util.str.pad(sec, '0', 2) },
                        { pattern: 's', out: sec }
                    ];

                    var pLen = patterns.length;
                    var out = format;
                    var ptn;
                    for (var p = 0; p < pLen; p++) {
                        ptn = new RegExp(patterns[p].pattern + '(?=[^\\]]*(?:\\[|$))');
                        out = out.split(ptn).join('[' + patterns[p].out + ']');
                    }
                    return out.split(/[\[\]]/).join('');
                },
                resolve: function (pattern) {

                },
                monthIndexes: {
                    'January': 0,
                    'February': 1,
                    'March': 2,
                    'April': 3,
                    'May': 4,
                    'June': 5,
                    'July': 6,
                    'August': 7,
                    'September': 8,
                    'October': 9,
                    'November': 10,
                    'December': 11
                },
                months: [
                    { name: 'January', abbreviation: 'Jan', number: '1' },
                    { name: 'February', abbreviation: 'Feb', number: '2' },
                    { name: 'March', abbreviation: 'Mar', number: '3' },
                    { name: 'April', abbreviation: 'Apr', number: '4' },
                    { name: 'May', abbreviation: 'May', number: '5' },
                    { name: 'June', abbreviation: 'Jun', number: '6' },
                    { name: 'July', abbreviation: 'Jul', number: '7' },
                    { name: 'August', abbreviation: 'Aug', number: '8' },
                    { name: 'September', abbreviation: 'Sep', number: '9' },
                    { name: 'October', abbreviation: 'Oct', number: '10' },
                    { name: 'November', abbreviation: 'Nov', number: '11' },
                    { name: 'December', abbreviation: 'Dec', number: '12' }
                ],
                days: [
                    { name: 'Sunday', abbreviation: 'Sun', number: '1' },
                    { name: 'Monday', abbreviation: 'Mon', number: '2' },
                    { name: 'Tuesday', abbreviation: 'Tue', number: '3' },
                    { name: 'Wednesday', abbreviation: 'Wed', number: '4' },
                    { name: 'Thursday', abbreviation: 'Thu', number: '5' },
                    { name: 'Friday', abbreviation: 'Fri', number: '6' },
                    { name: 'Saturday', abbreviation: 'Sat', number: '7' }
                ],
                daysSmall: [ //Mark Smaller abbreviation added
                    { name: 'Sunday', abbreviation: 'S', number: '1' },
                    { name: 'Monday', abbreviation: 'M', number: '2' },
                    { name: 'Tuesday', abbreviation: 'T', number: '3' },
                    { name: 'Wednesday', abbreviation: 'W', number: '4' },
                    { name: 'Thursday', abbreviation: 'T', number: '5' },
                    { name: 'Friday', abbreviation: 'F', number: '6' },
                    { name: 'Saturday', abbreviation: 'S', number: '7' }
                ],
                getFirstDayOfWeek: function (d) {
                    var day = d.getDay();
                    var diff = d.getDate() - day;
                    return new Date(d.setDate(diff));
                }
            },
            time: {
                propagate: function () {
                    var hours = '';
                    var minutes = DDSelectedOption('00', '00') + DDOption('15', '15') + DDOption('30', '30') + DDOption('45', '45');
                    var period = DDSelectedOption('AM', 'AM') + DDOption('PM', 'PM');

                    for (var i = 0; i < 11; i++) {
                        hours = hours + DDOption(+i + 1, +i + 1);
                    }
                    hours = hours + DDSelectedOption('12', '12');

                    return { hours: hours, minutes: minutes, period: period };
                },
                propagateArray: function () {
                    var hours = [];
                    var minutes = ['00', '15', '30', '45'];
                    var period = ['AM', 'PM'];

                    for (var i = 0; i < 12; i++) {
                        hours.push(+i + 1);
                    }

                    return { hours: hours, minutes: minutes, period: period };
                },
                propagateWorkhoursArray: function () {
                    var hours = [];
                    var minutes = ['00', '15', '30', '45'];
                    var period = ['AM', 'PM'];
                    var arr;
                    var hr = '';

                    for (var i = 0; i < 5; i++) {
                        hr = +i + 7;
                        arr = [
                            hr,
                            'AM'
                        ];
                        hours.push(arr);
                    }

                    arr = [
                        '12',
                        'PM'
                    ];
                    hours.push(arr);

                    for (var i = 0; i < 7; i++) {
                        hr = +i + 1;
                        arr = [
                            hr,
                            'PM'
                        ];
                        hours.push(arr);
                    }

                    return { hours: hours, minutes: minutes, period: period };
                }
            },
            controls: {
                calendar: {
                    template: {
                        body: function (rows) {
                            return '<div class="cal-body">' + rows + '</div>';
                        },
                        wvbody: function (rows) {
                            return '<div class="wvCalBody">' + rows + '</div>';
                        },
                        row: function (cells) {
                            return '<div class="cal-row">' + cells + '</div>';
                        },
                        headerRow: function (cells) {
                            return '<div class="cal-header-row">' + cells + '</div>';
                        },
                        cell: function (date) {
                            var cellid = adri.util.date.fmt({ date: date, format: 'MM-dd-yyyy' });
                            var sDate = adri.util.date.fmt({ date: date, format: 'yyyy-MM-dd' });
                            return '<div id="cal-cell-' + cellid + '" class="cal-cell" onclick="adri.ui.time.dateNode.add(\'' + sDate + '\',\'ui-datenodes\')">' +
                                '<div nohighlight class="cal-cell-date">' + date.getDate() + '</div>' +
                                '</div>';
                        },
                        inactiveCell: function (date) {
                            var cellid = date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear();
                            return '<div id="cal-cell-' + cellid + '" class="cal-inactive-cell">' +
                                '<div nohighlight class="cal-cell-date">' + date.getDate() + '</div>' +
                                '</div>';
                        },
                        title: function (date) {
                            return '<div nohighlight class="cal-title">' + adri.util.date.fmt({ date: date, format: 'MMMM yyyy' }) + '</div>';
                        },
                        wkviewTitle: function (date) {
                            return '<div nohighlight class="title-weekly-calendar vCenter centered">Week of ' + adri.util.date.fmt({ date: date, format: 'MMMM dd, yyyy' }) + '</div>';
                        },
                        header: function (wkdy) {
                            return '<div class="cal-header secHTxt">' + wkdy + '</div>';
                        },
                        wvheader: function (wkdy) {
                            return '<div class="wvHeader">' + wkdy + '<hr class="smallHR" /></div>';
                        },
                        button: function (date, dir, elmt) {
                            var cMap = {
                                'up': {
                                    icon: '&#xf138;',
                                    i: 1
                                },
                                'down': {
                                    icon: '&#xf137;',
                                    i: -1
                                }
                            };

                            dir = cMap[dir];

                            var d = new Date(date.getFullYear(), date.getMonth() + dir.i, 1);
                            var mthYr = adri.util.date.fmt({ date: d, format: 'MMMM yyyy' });
                            var clk = 'adri.util.controls.calendar.draw(\'' + elmt + '\',\'' + d.getMonth() + '\',\'' + d.getFullYear() + '\')';

                            return '<div nohighlight class="cal-button" onclick="' + clk + ';">' + dir.icon + '</div>';
                        },
                        controls: function (date, elmt) {
                            var tmp = adri.util.controls.calendar.template;
                            return tmp.button(date, 'down', elmt) + tmp.title(date) + tmp.button(date, 'up', elmt);
                        },
                        wvCell: function (date) {
                            var cellid = adri.util.date.fmt({ date: date, format: 'MM-dd-yyyy' });
                            var sDate = adri.util.date.fmt({ date: date, format: 'yyyy-MM-dd' });
                            var cellDate = adri.util.date.fmt({ date: date, format: 'MMM d' });

                            return '<div id="cal-cell-' + cellid + '" class="wvCell pBG ckable" onclick="adri.ui.dashboard.getInterviewsForDate(\'' + sDate + '\')">' +
                                '<div nohighlight class="wv-cell-date">' + cellDate + '</div>' +
                                '<div id="cal-cell-nodes-' + cellid + '"></div>' +
                                '</div>';
                        }
                    },
                    frame: function (minDate, maxDate, elmt) {
                        var tmp = adri.util.controls.calendar.template;
                        var header = '';
                        for (var d = 0; d < 7; d++) {
                            header = header + tmp.header(adri.util.date.days[d].abbreviation);
                        }

                        var row = '';
                        var cell = '';
                        var body = '';
                        var firstWeekday = minDate.getDay();
                        var firstDayDifference = 0 - firstWeekday;
                        var calDate = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate() + firstDayDifference);
                        var exNodes = $('#ui-datenodes').html();
                        if (exNodes === undefined) {
                            exNodes = '';
                        }

                        for (var w = 0; w < 6; w++) {
                            row = '';
                            for (var d = 0; d < 7; d++) {
                                if (calDate < minDate || calDate > maxDate) {
                                    cell = tmp.inactiveCell(calDate);
                                }
                                else {
                                    cell = tmp.cell(calDate);
                                }

                                row = row + cell;
                                calDate.setDate(calDate.getDate() + 1);
                            }
                            row = tmp.row(row);
                            body = body + row;
                        }

                        header = tmp.headerRow(header, elmt);
                        body = '<div class="cal-monthHeader">' + tmp.controls(minDate, elmt) + '</div><div class="cal-body">' + header + body + '</div>';
                        body = body + '<div id="ui-datenodes" class="ti-schedule-nodes">' + exNodes + '</div>';
                        body = body + '<div class="cal-footer-row"><button class="bigButton mainBG negTxt ckable" type="button" onclick="adri.ui.time.submit()">Add Times</button></div>';
                        return body;
                    },
                    draw: function (elmt, mth, yr) {
                        var cal = adri.util.controls.calendar;
                        var minDate = new Date(yr, mth, 1);
                        var maxDate = new Date(yr, (+mth + 1), 0);

                        var dates = adri.util.date.propagate(minDate, maxDate);
                        var times = adri.util.time.propagate();

                        var $el = $('#' + elmt);
                        $el.html(cal.frame(minDate, maxDate, elmt));
                    },
                    frameWeeklyView: function (wkDate) {
                        var fDate = adri.util.date.getFirstDayOfWeek(wkDate);
                        var tmp = adri.util.controls.calendar.template;
                        var header = '';
                        for (var d = 0; d < 7; d++) {
                            header = header + tmp.wvheader(adri.util.date.days[d].abbreviation);
                        }

                        var row = '';
                        var cell = '';
                        var body = '';

                        row = '';
                        for (var d = 0; d < 7; d++) {
                            cell = tmp.wvCell(fDate);
                            row = row + cell;
                            fDate.setDate(fDate.getDate() + 1);
                        }
                        row = tmp.row(row);
                        body = body + row;

                        header = tmp.headerRow(header);
                        body = '<div class="mobile-hscroll"><div class="wvCalBody">' + header + body + '</div></div>';
                        body = body + '<div id="ui-datenodes" class="date-nodes"></div>';
                        body = body + '<div class="cal-footer-row"></div>';
                        body = '<div class="cycle-weekly-calendar"><div class="stdWidget vCenter right ckablef" onclick="adri.util.controls.calendar.cycleWeeklyView(-1,\'' + wkDate + '\');">&#xf137;</div></div>' +
                            '<div class="weekly-cal-title-cntr">' + tmp.wkviewTitle(wkDate) + '</div>' +
                            '<div class="cycle-weekly-calendar"><div class="stdWidget vCenter left ckablef" onclick="adri.util.controls.calendar.cycleWeeklyView(1,\'' + wkDate + '\');">&#xf138;</div></div>' +
                            '<hr class="titleHR" />' +
                            body;
                        return body;
                    },
                    drawWeeklyView: function (wkDate) {
                        var wkvw = adri.util.controls.calendar.frameWeeklyView(wkDate);
                        return wkvw;
                    },
                    cycleWeeklyView: function (m, wkDate) {
                        m = m * 7;
                        var db = adri.ui.dashboard;
                        var d = new Date(wkDate);
                        d.setDate(d.getDate() + m);

                        $('#db-weekly-view').html(adri.util.controls.calendar.drawWeeklyView(d));
                        db.getInterviews(function (data) {
                            db.drawInterviews(data);
                        });
                    }
                },
                calendarSmall: {
                    template: {
                        body: function (rows) {
                            return '<div class="cal-body">' + rows + '</div>';
                        },
                        wvbody: function (rows) {
                            return '<div class="wvCalBody">' + rows + '</div>';
                        },
                        row: function (cells) {
                            return '<div class="cal-row">' + cells + '</div>';
                        },
                        headerRow: function (cells) { //Mark: Spacer added
                            return '<div class="cal-header-row">' + cells + '</div><div class="cal-header-row spacer"></div>';
                        },
                        cell: function (date) { //Mark: Removed onclick="adri.ui.time.dateNode.add(\'' + sDate + '\',\'ui-datenodes\')"
                            var cellid = adri.util.date.fmt({ date: date, format: 'MM-dd-yyyy' });
                            var sDate = adri.util.date.fmt({ date: date, format: 'yyyy-MM-dd' });
                            //adri.ui.time.dateNode.add(sDate, 'ui-datenodes');
                            return '<div id="cal-cell-' + cellid + '" class="cal-cell hover-underline" onclick="adri.ui.dashboard.getInterviewsForDate(\'' + sDate + '\', \'' + cellid + '\')">' +
                                '<div nohighlight class="cal-cell-date">' + date.getDate() + '</div>' +
                                '</div>';
                        },
                        inactiveCell: function (date) {
                            var cellid = date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear();
                            return '<div id="cal-cell-' + cellid + '" class="cal-inactive-cell">' +
                                '<div nohighlight class="cal-cell-date">' + date.getDate() + '</div>' +
                                '</div>';
                        },
                        title: function (date) {
                            return '<div nohighlight class="cal-title">' + adri.util.date.fmt({ date: date, format: 'MMMM yyyy' }) + '</div>';
                        },
                        wkviewTitle: function (date) { //Mark: Changing date format to be returned
                            return '<div nohighlight class="title-weekly-calendar right">' + adri.util.date.fmt({ date: date, format: 'MMM dd' }) + '</div>';
                        },
                        header: function (wkdy) {
                            return '<div class="cal-header secHTxt">' + wkdy + '</div>';
                        },
                        wvheader: function (wkdy) {
                            return '<div class="wvHeader">' + wkdy + '<hr class="smallHR" /></div>';
                        },
                        button: function (date, dir, elmt) {
                            var cMap = {
                                'up': {
                                    icon: '&#xE315;',
                                    i: 1
                                },
                                'down': {
                                    icon: '&#xE314;',
                                    i: -1
                                }
                            };

                            dir = cMap[dir];

                            var d = new Date(date.getFullYear(), date.getMonth() + dir.i, 1);
                            var mthYr = adri.util.date.fmt({ date: d, format: 'MMMM yyyy' });
                            var clk = 'adri.util.controls.calendarSmall.draw(\'' + elmt + '\',\'' + d.getMonth() + '\',\'' + d.getFullYear() + '\')';

                            return '<div nohighlight class="cal-button" onclick="' + clk + ';">' + dir.icon + '</div>';
                        },
                        controls: function (date, elmt) {
                            var tmp = adri.util.controls.calendarSmall.template;
                            return tmp.button(date, 'down', elmt) + tmp.title(date) + tmp.button(date, 'up', elmt);
                        },
                        wvCell: function (date) {
                            var cellid = adri.util.date.fmt({ date: date, format: 'MM-dd-yyyy' });
                            var sDate = adri.util.date.fmt({ date: date, format: 'yyyy-MM-dd' });
                            var cellDate = adri.util.date.fmt({ date: date, format: 'MMM d' });

                            return '<div id="cal-cell-' + cellid + '" class="wvCell pBG ckable" onclick="adri.ui.dashboard.getInterviewsForDate(\'' + sDate + '\', \'' + cellid + '\')">' +
                                '<div nohighlight class="wv-cell-date">' + cellDate + '</div>' +
                                '<div id="cal-cell-nodes-' + cellid + '"></div>' +
                                '</div>';
                        }
                    },
                    frame: function (minDate, maxDate, elmt) { //Mark: added modified frame function for opening dashboard. Changes include the removal of the Add Times button.
                        var tmp = adri.util.controls.calendarSmall.template;
                        var header = '';
                        for (var d = 0; d < 7; d++) {
                            header = header + tmp.header(adri.util.date.daysSmall[d].abbreviation);
                        }

                        var row = '';
                        var cell = '';
                        var body = '';
                        var firstWeekday = minDate.getDay();
                        var firstDayDifference = 0 - firstWeekday;
                        var calDate = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate() + firstDayDifference);
                        var exNodes = $('#ui-datenodes').html();
                        if (exNodes === undefined) {
                            exNodes = '';
                        }

                        for (var w = 0; w < 6; w++) {
                            row = '';
                            for (var d = 0; d < 7; d++) {
                                if (calDate < minDate || calDate > maxDate) {
                                    cell = tmp.inactiveCell(calDate);
                                }
                                else {
                                    cell = tmp.cell(calDate);
                                }

                                row = row + cell;
                                calDate.setDate(calDate.getDate() + 1);
                            }
                            row = tmp.row(row);
                            body = body + row;
                        }

                        header = tmp.headerRow(header, elmt);
                        body = '<div class="cal-monthHeader">' + tmp.controls(minDate, elmt) + '</div><div class="cal-body">' + header + body + '</div>';
                        body = body + '<div id="ui-datenodes" class="ti-schedule-nodes">' + exNodes + '</div>';
                        body = body + '<div class="cal-footer-row"></div>';
                        return body;
                    },
                    draw: function (elmt, mth, yr) {
                        var cal = adri.util.controls.calendarSmall;
                        var minDate = new Date(yr, mth, 1);
                        var maxDate = new Date(yr, (+mth + 1), 0);

                        var dates = adri.util.date.propagate(minDate, maxDate);
                        var times = adri.util.time.propagate();

                        var $el = $('#' + elmt);
                        $el.html(cal.frame(minDate, maxDate, elmt));
                        //$el.html(cal.frame(minDate, maxDate, elmt));
                    },
                    frameWeeklyView: function (wkDate) { //Mark: cycleWeekly View markup changed. template.row is no longer being used. 
                        var cDay = new Date;

                        if (cDay.getDay === wkDate.getDay) {
                            cDay = 'All Scheduled Calls';
                        }

                        var tmp = adri.util.controls.calendarSmall.template;
                        var header = '';
                        for (var d = 0; d < 7; d++) {
                            header = header + tmp.wvheader(adri.util.date.days[d].abbreviation);
                        }

                        var row = '';
                        var cell = '';
                        var body = '';

                        row = '';
                        row = tmp.row(row);

                        body = '<div class="dashboard-header-block">' +
                            '<span id="sch-selected-date" class="dashboard-header-text"></span>' +
                            '</div>' +
                            body;
                        return body;
                    },
                    drawWeeklyView: function (wkDate) {
                        var wkvw = adri.util.controls.calendarSmall.frameWeeklyView(wkDate);
                        return wkvw;
                    },
                    cycleWeeklyView: function (m, wkDate) {
                        m = m * 7;
                        var db = adri.ui.dashboard;
                        var d = new Date(wkDate);
                        d.setDate(d.getDate() + m);

                        $('#db-weekly-view').html(adri.util.controls.calendarSmall.drawWeeklyView(d));
                        db.getInterviews(function (data) {
                            db.drawInterviews(data);
                        });
                    }
                },
                switchCSS: function () {
                    $('#css-switch-trugreen').click(function () {
                        $('link[href="adri/adri.ras.generic.css"]').attr('href', 'adri/adri.ras.css');
                    });
                    $('#css-switch-adri').click(function () {
                        $('link[href="adri/adri.ras.css"]').attr('href', 'adri/adri.ras.generic.css');
                    });
                },
                reloadLocation: function () {
                    location.reload();
                }
            },
            uploader: {
                files: {},
                template: function () {
                    var headers = 'Candidate_ID,Candidate,Candidate_Phone_Number,Candidate_E-Mail,Candidate_Source,Date_Candidate_was_Added_to_Requisition,Requisition_Number,Requisition_Title,Requisition_Type,Requisition_Status,Division,Region,Location,Job_Code,Job_Title,Job_Family,Recruiter_1_Employee_ID,Recruiter_1_Name,Recruiter_1_E-Mail,Recruiter_1_Work_City,Recruiter_1_Work_State,Recruiter_2_Name,Recruiter_2_E-Mail,Recruiter_3_Employee_ID,Recruiter_3_Name,Recruiter_3_E-Mail,Recruiter_4_Employee_ID,Recruiter_4_Name,Recruiter_4_E-Mail,Recruiter_5_Employee_ID,Recruiter_5_Name,Recruiter_5_E-Mail,Linked_Requisition_Number,Linked_Requisition_Title,Linked_Requisition_Type,Linked_Requisition_Status,Linked_Requisition_External_Career_Site_URL\r\n';
                    var encodedUri = encodeURI(headers);
                    var link = document.createElement("a");
                    link.href = window.URL.createObjectURL(new Blob([headers], { type: 'text/csv' }));
                    link.download = "template.csv";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                },
                open: function () {
                    adri.util.uploader.files = {};

                    var dz = '<div class="file-drop" id="dz-input"><div class="vCenter">Drop files here</div></div>' +
                        '<div id="progress-bars" class="file-progress"></div>' +
                        '<div id="upload-msg"></div>' +
                        '<div><button type="button" class="bigButton mainBG negTxt ckable" onclick="adri.util.uploader.upload();" id="upload-button">Upload!</button></div>';
                    $('#smallModal').html(dz);

                    function handleFileSelect(evt) {
                        evt.stopPropagation();
                        evt.preventDefault();
                        $('#progress-bars').html('');
                        var files = evt.dataTransfer.files;
                        var len = files.length;
                        for (var i = 0; i < len; i++) {
                            $('#progress-bars').append('<span>' + files[i].name + '</span><div id="progress-bar-' + i + '" class="file-progress"><div id="pct-' + i + '" class="percent">0%</div></div>');
                            $('#pct-' + i).css('max-width', '0%');
                            $('#pct-' + i).html('0%');
                            adri.util.uploader.read(files[i], i);
                        }

                    }

                    function handleDragOver(evt) {
                        evt.stopPropagation();
                        evt.preventDefault();
                        evt.dataTransfer.dropEffect = 'copy';
                    }

                    // Setup the dnd listeners.
                    var dropZone = document.getElementById('dz-input');
                    dropZone.addEventListener('dragover', handleDragOver, false);
                    dropZone.addEventListener('drop', handleFileSelect, false);

                    adri.ui.modal.small.open();
                },
                read: function (file, i) {
                    var reader = new FileReader();
                    reader.onerror = errorHandler;
                    reader.onprogress = function (e) {
                        updateProgress(e, i);
                    };
                    reader.onabort = function (e) {
                        alert('File read cancelled');
                    };

                    reader.onloadstart = function (e) {
                        $('#progress-bar-' + i).addClass('loading');
                    };
                    reader.onload = function (e) {
                        $('#pct-' + i).css('max-width', '100%');
                        $('#pct-' + i).html('Ready to Upload');
                        setTimeout(function () {
                            $('#progress-bar-' + i).removeClass('loading');
                        }, 2000);
                        adri.util.uploader.files[file.name] = {
                            name: file.name,
                            data: btoa(e.target.result), //encoded to base 64 for transfer,
                            index: i
                        };
                    }
                    $('#dz-cancel').click(function () {
                        adri.util.uploader.abort(reader);
                    });

                    // Read in as text
                    reader.readAsText(file);

                    function errorHandler(evt) {
                        switch (evt.target.error.code) {
                            case evt.target.error.NOT_FOUND_ERR:
                                alert('File Not Found!');
                                break;
                            case evt.target.error.NOT_READABLE_ERR:
                                alert('File is not readable');
                                break;
                            case evt.target.error.ABORT_ERR:
                                break; // noop
                            default:
                                alert('An error occurred reading this file.');
                        };
                    }

                    function updateProgress(evt, i) {
                        if (evt.lengthComputable) {
                            var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
                            // Increase the progress bar length.
                            if (percentLoaded < 100) {
                                $('#pct-' + i).css('max-width', percentLoaded + '%');
                                $('#pct-' + i).html(percentLoaded + '%');
                            }
                        }
                    }
                },
                abort: function (reader) {
                    reader.abort();
                },
                upload: function () {
                    //iterate through each member of adri.util.uploader.files, call service to check file contents and upload or reject
                    $('#upload-msg').html('');
                    for (var f in adri.util.uploader.files) {
                        var file = adri.util.uploader.files[f];
                        adri.util.uploader.process(file, adri.util.uploader.complete, adri.util.uploader.reject);
                    }
                },
                process: function (file, complete, reject) {
                    var data = {
                        userID: constants.interview.user,
                        clientID: constants.interview.client,
                        uiID: constants.interview.ui,
                        filename: file.name,
                        filedata: file.data
                    };

                    $.ajax({
                        type: "POST",
                        contentType: 'application/json',
                        dataType: "json",
                        url: constants.urls.uploadFile,
                        data: JSON.stringify(data),
                        success: function (response) {
                            complete(response, file);
                        },
                        error: function (xhr, ajaxOptions, error) {
                            reject(xhr, file);
                        }
                    });
                },
                reject: function (response, file) {
                    $('#pct-' + file.index).css('background-color', '#8a110e');
                    $('#pct-' + file.index).css('color', 'white');
                    $('#pct-' + file.index).html('Failed to Upload');
                },
                complete: function (response, file) {
                    if (response.hasOwnProperty('errorMessage')) {
                        adri.util.uploader.reject(response, file);
                    }
                    else {
                        $('#pct-' + file.index).css('background-color', '#6dcc50');
                        $('#pct-' + file.index).html('Uploaded Successfully! Parties will be notified shortly.');
                    }
                }
            },
            uploaderNew: {
                files: {},
                template: function () {
                    var headers = 'Candidate_ID,Candidate,Candidate_Phone_Number,Candidate_E-Mail,Candidate_Source,Date_Candidate_was_Added_to_Requisition,Requisition_Number,Requisition_Title,Requisition_Type,Requisition_Status,Division,Region,Location,Job_Code,Job_Title,Job_Family,Recruiter_1_Employee_ID,Recruiter_1_Name,Recruiter_1_E-Mail,Recruiter_1_Work_City,Recruiter_1_Work_State,Recruiter_2_Name,Recruiter_2_E-Mail,Recruiter_3_Employee_ID,Recruiter_3_Name,Recruiter_3_E-Mail,Recruiter_4_Employee_ID,Recruiter_4_Name,Recruiter_4_E-Mail,Recruiter_5_Employee_ID,Recruiter_5_Name,Recruiter_5_E-Mail,Linked_Requisition_Number,Linked_Requisition_Title,Linked_Requisition_Type,Linked_Requisition_Status,Linked_Requisition_External_Career_Site_URL\r\n';
                    var encodedUri = encodeURI(headers);
                    var link = document.createElement("a");
                    link.href = window.URL.createObjectURL(new Blob([headers], { type: 'text/csv' }));
                    link.download = "template.csv";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                },
                open: function () {
                    var $Content = $('.ui-content-body');
                    $Content.html('');
                    adri.util.uploaderNew.files = {};

                    var dz = '<div class="file-drop" id="dz-input"><div class="vCenter">Drop files here</div></div>' +
                        '<div id="progress-bars" class="file-progress"></div>' +
                        '<div id="upload-msg"></div>' +
                        '<div><button type="button" class="bigButton mainBG negTxt ckable" onclick="adri.util.uploaderNew.upload();" id="upload-button">Upload!</button></div>';
                    $($Content).html(dz);

                    function handleFileSelect(evt) {
                        evt.stopPropagation();
                        evt.preventDefault();
                        $('#progress-bars').html('');
                        var files = evt.dataTransfer.files;
                        var len = files.length;
                        for (var i = 0; i < len; i++) {
                            $('#progress-bars').append('<div id="progress-bar-' + i + '" class="file-progress"><div id="pct-' + i + '" class="percent">0%</div></div>');
                            $('#pct-' + i).css('max-width', '0%');
                            $('#pct-' + i).html('0%');
                            adri.util.uploaderNew.read(files[i], i);
                        }

                    }

                    function handleDragOver(evt) {
                        evt.stopPropagation();
                        evt.preventDefault();
                        evt.dataTransfer.dropEffect = 'copy';
                    }

                    // Setup the dnd listeners.
                    var dropZone = document.getElementById('dz-input');
                    dropZone.addEventListener('dragover', handleDragOver, false);
                    dropZone.addEventListener('drop', handleFileSelect, false);

                    //adri.ui.modal.small.open();
                },
                read: function (file, i) {
                    var reader = new FileReader();
                    reader.onerror = errorHandler;
                    reader.onprogress = function (e) {
                        updateProgress(e, i);
                    };
                    reader.onabort = function (e) {
                        alert('File read cancelled');
                    };

                    reader.onloadstart = function (e) {
                        $('#progress-bar-' + i).addClass('loading');
                    };
                    reader.onload = function (e) {
                        $('#pct-' + i).css('max-width', '100%');
                        $('#pct-' + i).html('\'' + file.name + '\' is ready to upload');
                        setTimeout(function () {
                            $('#progress-bar-' + i).removeClass('loading');
                        }, 2000);
                        adri.util.uploaderNew.files[file.name] = {
                            name: file.name,
                            data: btoa(unescape(encodeURIComponent(e.target.result))), //btoa(e.target.result) MARK This was needed due to error "Failed to execute 'btoa' on 'Window': The string to be encoded contains characters outside of the Latin1 range."
                            index: i
                        };
                    }
                    $('#dz-cancel').click(function () {
                        adri.util.uploaderNew.abort(reader);
                    });

                    // Read in as text
                    reader.readAsText(file);

                    function errorHandler(evt) {
                        switch (evt.target.error.code) {
                            case evt.target.error.NOT_FOUND_ERR:
                                alert('File Not Found!');
                                break;
                            case evt.target.error.NOT_READABLE_ERR:
                                alert('File is not readable');
                                break;
                            case evt.target.error.ABORT_ERR:
                                break; // noop
                            default:
                                alert('An error occurred reading this file.');
                        };
                    }

                    function updateProgress(evt, i) {
                        if (evt.lengthComputable) {
                            var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
                            // Increase the progress bar length.
                            if (percentLoaded < 100) {
                                $('#pct-' + i).css('max-width', percentLoaded + '%');
                                $('#pct-' + i).html(percentLoaded + '%');
                            }
                        }
                    }
                },
                abort: function (reader) {
                    reader.abort();
                },
                upload: function () {
                    console.log(adri.util.uploaderNew.files);
                    //iterate through each member of adri.util.uploader.files, call service to check file contents and upload or reject
                    $('#upload-msg').html('');
                    for (var f in adri.util.uploaderNew.files) {
                        var file = adri.util.uploaderNew.files[f];
                        adri.util.uploaderNew.process(file, adri.util.uploaderNew.complete, adri.util.uploaderNew.reject);
                    }
                },
                process: function (file, complete, reject) {
                    var data = {
                        userID: constants.interview.user,
                        clientID: constants.interview.client,
                        uiID: constants.interview.ui,
                        filename: file.name,
                        filedata: file.data
                    };

                    $.ajax({
                        type: "POST",
                        contentType: 'application/json',
                        dataType: "json",
                        url: constants.urls.uploadFile,
                        data: JSON.stringify(data),
                        success: function (response) {
                            complete(response, file);
                        },
                        error: function (xhr, ajaxOptions, error) {
                            reject(xhr, file);
                        }
                    });
                },
                reject: function (response, file) {
                    $('#pct-' + file.index).css('background-color', '#8a110e');
                    $('#pct-' + file.index).css('color', 'white');
                    $('#pct-' + file.index).html('Failed to Upload');
                },
                complete: function (response, file) {
                    if (response.hasOwnProperty('errorMessage')) {
                        adri.util.uploaderNew.reject(response, file);
                    }
                    else {
                        $('#pct-' + file.index).css('background-color', '#6dcc50');
                        $('#pct-' + file.index).html('Uploaded Successfully! Parties will be notified shortly.');
                        // ADD BOT EMAIL
                    }
                }
            }
        }
    };
    return adri;
})();

$(document).ready(function () {
    adri.init();
});
