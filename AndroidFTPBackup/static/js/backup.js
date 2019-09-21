const textarea = $('#text-streaming');
const name = $('#ftp-user');
const ip = $('#ftp-ip');
const pass = $('#ftp-pass');
const port = $('#ftp-port');
const ftp_backup = $('#ftp-backup');
const refresh = $('#refresh-wifi-connections');
const test = $('#ftp-test');
const backup_div = $('#backup-div');

$(document).ready(function(){

    window.setInterval(function() {
        if (textarea.scrollTop() + 500 > textarea[0].scrollHeight)
            textarea.scrollTop(textarea[0].scrollHeight);
    }, 100);

    refresh.click(function () {
        refresh.addClass('fast-spin');
        ip.val('');
        get_backup_data();
    });

    function get_backup_data() {
        $.ajax({
            url: 'ajax/ftp_data',
            data: {'data': ''},
            success: function (data) {
                ip.removeClass('is-invalid');
                ftp_backup.removeClass('is-valid');
                name.val(data['name']);
                ip.val(data['ip']);
                if (data['ip'] === 'Not Found') {
                    ip.addClass('is-invalid');
                } else {
                    ftp_backup.addClass('is-valid');
                }
                pass.val(data['pass']);
                port.val(data['port']);
                refresh.removeClass('fast-spin');
            }
        });
    }

    get_backup_data();

    $.ajax({
        url: 'ajax/folder_list',
        data: {'data':''},
        success: function (data) {
            $('#folder-list').html(data);
        }
    });

    const outputSocket = new WebSocket('ws://' + window.location.host + '/ws/code/output/');

    outputSocket.onmessage = function(e) {
        textarea.html(textarea.html() + JSON.parse(e.data)['message']);
    };

});

$("#eye-style").click(function (event) {
    event.preventDefault();

    if (pass.attr("type") === "text") {
        pass.attr('type', 'password');
        $(this).removeClass('fa-eye');
        $(this).addClass('fa-eye-slash');
    } else if (pass.attr("type") === "password") {
        pass.attr('type', 'text');
        $(this).addClass('fa-eye');
        $(this).removeClass('fa-eye-slash');
    }
});

test.click(function () {
    test_aria = $('#aria-test');

    $.ajax({
        url: 'ajax/test_connections',
        data: {
            'ip': ip.val(),
            'user': name.val(),
            'pass': pass.val(),
            'port': port.val(),
        },
        success: function (data) {
            if (data === '0') {
                backup_div.removeAttr('hidden');
                test_aria.html('Test Successful').attr('style', 'color:green !important');
            } else if (data === '1') {
                test_aria.html('Username or password is incorrect!').attr('style', 'color:red !important');
            } else {
                test_aria.html('Connection Refused, Confirm if FTP Server is active.').attr('style', 'color:black !important');
            }
        }
    });
});

ftp_backup.click(function () {
    const ModalCenter = $('#ModalCenter');

    if (ftp_backup.hasClass('is-valid')) {
        ModalCenter.modal('show');
        $('#confirmationModalSave').click(function () {
            ModalCenter.modal('hide');
            backup_div.attr('hidden', 'true');
            $('#run-code').removeAttr('hidden');
            textarea.html();
            $.ajax({
                url: 'ajax/start_backup',
                data: {'data': ''},
                success: function (data) {
                    textarea.html(data + "\n");
                }
            });
        });
    }
    return false;
});
