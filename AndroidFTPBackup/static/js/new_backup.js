const backup_location = $('#backup-location');
const nmap_range = $('#nmap-range');
const ftp_port = $('#ftp-port');
const ftp_test = $('#ftp-test');

$(document).ready(function(){
    get_connections();

    function get_connections() {
        if (nmap_range.hasClass('is-valid')) {
            const ip = nmap_range.val();

            $.ajax({
                url: 'ajax/get_connections',
                data: {'ip': ip},
                success: function (data) {
                    $('#wifi-connections').html(data);
                    $('#refresh-wifi-connections').removeClass('fast-spin');
                }
            })
        }
    }

    $('#refresh-wifi-connections').click(function () {
        const label_ip = $('#label-ftp-ip');
        const ftp_ip = $('#ftp-ip');

        $('#wifi-connections').removeClass('is-invalid').removeClass('is-valid')
            .html("<option selected>Loading...</option>");

        label_ip.removeClass('text-success').removeClass('text-danger');
        $('#label-wifi-connections').removeClass('text-success').removeClass('text-danger');
        ftp_ip.removeClass('is-invalid').removeClass('is-valid');
        ftp_ip[0].placeholder = 'Select your device for IP';
        $('#refresh-wifi-connections').addClass('fast-spin');

        get_connections();
    });

    $("#eye-style").click(function (event) {
        event.preventDefault();
        const pass = $('#ftp-pass');
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

});

nmap_range.focusout(function () {
    const ip = $(this).val();
    const label = $('#label-nmap-range');

    label.removeClass('text-success').removeClass('text-danger');
    $(this).removeClass('is-invalid').removeClass('is-valid');
    if (ip.match('^([0-9]{1,3}\\.){3}[0-9]{1,3}(\\/([0-9]|[1-2][0-9]|3[0-2]))?$')) {
        $(this).addClass('is-valid');
        label.addClass('text-success');
        $('#nmap-ip').html(ip);
    } else {
        $(this).addClass('is-invalid');
        label.addClass('text-danger');
    }
});

backup_location.focusout(function () {
    const ip = $(this).val().replace(new RegExp('[\\\\]', 'g'), '/');
    const label = $('#label-backup-location');

    label.removeClass('text-success').removeClass('text-danger');
    $(this).removeClass('is-invalid').removeClass('is-valid');

    if (ip.match('^[a-zA-Z]:\\/\\w(\\w+\\/)*\\w*$')) {
        $(this).addClass('is-valid');
        label.addClass('text-success');
    } else {
        $(this).addClass('is-invalid');
        label.addClass('text-danger');
    }
});

ftp_port.focusout(function () {
    const ip = $(this).val();
    const label = $('#label-ftp-port');

    label.removeClass('text-success').removeClass('text-danger');
    $(this).removeClass('is-invalid').removeClass('is-valid');

    if (ip.match('^(6[0-5][0-5][0-3][0-5])$|^([0-5]?(\\d){0,4})$') && ip !== '') {
        $(this).addClass('is-valid');
        label.addClass('text-success');
    } else {
        $(this).addClass('is-invalid');
        label.addClass('text-danger');
    }
});

$('#wifi-connections').click(function () {
    const label = $('#label-wifi-connections');
    const label_ip = $('#label-ftp-ip');

    const ip = $("#wifi-connections option:selected").html();
    const ftp_ip = $('#ftp-ip');

    label.removeClass('text-success').removeClass('text-danger');
    label_ip.removeClass('text-success').removeClass('text-danger');
    $(this).removeClass('is-invalid').removeClass('is-valid');

    ftp_ip.removeClass('is-invalid').removeClass('is-valid');
    if (!ip.match('Choose your device') && !ip.match('Loading...')) {
        $(this).addClass('is-valid');
        ftp_ip[0].placeholder = ip.split(' - ')[0];
        ftp_ip.addClass('is-valid');
        label.addClass('text-success');
        label_ip.addClass('text-success');
    } else {
        ftp_ip[0].placeholder = 'Select your device for IP';
        $(this).addClass('is-invalid');
        ftp_ip.addClass('is-invalid');
        label.addClass('text-danger');
        label_ip.addClass('text-danger');
    }
});

ftp_test.click(function () {
    const label = $('#label-ftp-test');
    const label_user = $('#label-ftp-user');
    const label_pass = $('#label-ftp-pass');
    const ftp_user = $('#ftp-user');
    const ftp_pass = $('#ftp-pass');
    const ftp_pass_hidden = $('#ftp-pass-hidden');
    const ftp_ip = $('#ftp-ip');
    const ip = ftp_ip[0].placeholder;
    const user = ftp_user.val();
    const pass = ftp_pass.val();
    const port = ftp_port.val();
    const file_list_div = $('#file-list-div');
    const label_ip = $('#label-ftp-ip');

    if (ftp_ip.hasClass('is-valid') && ftp_port.hasClass('is-valid')) {

    } else {
        ftp_ip.addClass('is-invalid');
        label_ip.addClass('text-danger');
        return;
    }

    $(this).html("<i class=\'fas fa-circle-notch fast-spin\'></i>");

    label.removeClass('text-success').removeClass('text-danger');
    label_user.removeClass('text-success').removeClass('text-danger');
    label_pass.removeClass('text-success').removeClass('text-danger');
    ftp_user.removeClass('is-valid').removeClass('is-invalid');
    ftp_pass.removeClass('is-valid').removeClass('is-invalid');
    ftp_pass_hidden.removeClass('is-valid').removeClass('is-invalid');
    file_list_div.html('');

    function get_dir_list() {
        $.ajax({
            url: 'ajax/get_dir_list',
            data: {
                'ip': ip,
                'user': user,
                'pass': pass,
                'port': port
            },
            success: function (data) {
                file_list_div.html(data);
                $('#ftp-dir-help').html('Select the files you want to backup');
            }
        });
    }

    $.ajax({
        url: 'ajax/test_connections',
        data: {
            'ip': ip,
            'user': user,
            'pass': pass,
            'port': port
        },
        success: function (data) {
            if (data === '0') {
                $('#ftp-test-help').html('Test Successful').attr('style', 'color:green !important');
                ftp_user.addClass('is-valid');
                ftp_pass.addClass('is-valid');
                ftp_pass_hidden.addClass('is-valid');
                label.addClass('text-success');
                label_user.addClass('text-success');
                label_pass.addClass('text-success');
                $('#ftp-test-hidden').removeClass('is-invalid').addClass('is-valid');

                get_dir_list();
            } else if (data === '1') {
                $('#ftp-test-help').html('Username or password is incorrect!').attr('style', 'color:red !important');
                ftp_user.addClass('is-invalid');
                ftp_pass.addClass('is-invalid');
                ftp_pass_hidden.addClass('is-invalid');
                label.addClass('text-danger');
                label_user.addClass('text-danger');
                label_pass.addClass('text-danger');
            } else if (data === '2') {
                $('#ftp-test-help').html('Connection Refused, Confirm if FTP Server is active.').attr('style', 'color:black !important');
            }
            ftp_test.html('FTP Test');
        },
    });

});

function validate() {
    const ftp_ip = $('#ftp-ip');
    const ftp_user = $('#ftp-user');
    const ftp_pass = $('#ftp-pass');
    const ftp_test_check = $('#ftp-test-hidden');

    let data = {};
    let failed = false;
    let body = '';

    if (!backup_location.hasClass('is-valid')) {
        const label = $('#label-backup-location');

        label.removeClass('text-success').removeClass('text-danger');
        backup_location.removeClass('is-invalid').removeClass('is-valid');
        label.addClass('text-danger');
        backup_location.removeClass('is-valid').addClass('is-invalid');

        failed = true;
    } else {
        data['backup_location'] = backup_location.val();
        body += '<i class="text-primary">Backup Location: </i>' + data['backup_location'] + '<br>';
    }

    if (!ftp_test_check.hasClass('is-valid')) {
        const label = $('#label-ftp-test');

        label.removeClass('text-success').removeClass('text-danger');
        ftp_test.removeClass('is-invalid').removeClass('is-valid');
        label.addClass('text-danger');
        ftp_test_check.addClass('is-invalid');

        failed = true;
    } else {
        data['ftp_ip'] = ftp_ip[0].placeholder;
        data['ftp_mac'] = $("#wifi-connections option:selected").attr('name');
        data['nmap_range'] = nmap_range.val();
        data['ftp_user'] = ftp_user.val();
        data['ftp_pass'] = ftp_pass.val();
        data['ftp_port'] = ftp_port.val();
        body += '<i class="text-primary">Nmap Range: </i>' + data['nmap_range'] + '<br>';
        body += '<i class="text-primary">FTP IP: </i>' + data['ftp_ip'] + '<br>';
        body += '<i class="text-primary">FTP Username: </i>' + data['ftp_user'] + '<br>';
            body += '<i class="text-primary">FTP Password: </i>' + data['ftp_pass'] + '<br>';
        body += '<i class="text-primary">FTP Port: </i>' + data['ftp_port'] + '<br>';
    }

    let backup_items = [];
    body +=  '<br>' + '<i class="text-primary">Backup these folders: </i>';
    $('#file-list-div input:checked').each(function() {
        const id = $(this).attr('id');
        backup_items.push(id);
        if (id.includes('_switch1')) {
            body += ' - <i class="fas fa-calendar-alt" title="Folders with year and month of creation will created for backing up this folder"></i>';
        } else if (id.includes('_switch2')) {
            body += ' - <i class="fas fa-sitemap" title="Folders within this folders will be backed up"></i>';
        } else {
            body  += '<br>';
            body += id;
        }
    });

    if (backup_items.length < 1) {
        let label = $('#label-file-list-div');
        let ftp_list_hidden = $('#ftp-list-hidden');

        label.removeClass('text-success').removeClass('text-danger');
        label.addClass('text-danger');
        ftp_list_hidden.removeClass('is-invalid').removeClass('is-valid');
        ftp_list_hidden.addClass('is-invalid');

        failed = true;
    }

    if (failed) {
        return false;
    }

    data['backup_items'] = backup_items.toString();

    $('#confirmationModalBody').html(body);
    $('#confirmationModal').modal('show');

    $('#confirmationModalSave').click(function () {
        $('#confirmationModal').modal('hide');

        $.ajax({
            url: 'ajax/save_config',
            data: {'conf': data},
            success: function () {
                location.reload();
            }
        });
    });

    return false;
}