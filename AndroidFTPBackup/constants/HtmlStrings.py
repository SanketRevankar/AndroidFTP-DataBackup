DIV_LIST_FLUSH = '<div class="list-group list-group-flush">'
END_DIV = '</div>'
LIST_CONTAINER = '<div class="list-group list-group-flush list-group-div" id="dir_list">'
HEADER_ = '<li class="list-group-item list-group-item-action list-group-item-secondary list-header">'
SIZE_SPAN = ' <span class="badge badge-pill badge-light size-badge">{} {}</span>'
END_LI = '</li>'
END_A = '"></a>'
OPTION_IP_MAC = '<option value="{}" name="{}">{}</option>'
OPTION_IP_MAC_VENDOR = '<option value="{}" name="{}">{} - {}</option>'
DIV_FORM_ROW_ = '<div class="form-row">'
CHOOSE_DEVICE = '<option selected>Choose your device</option>'
ONCLICK_AJAX_SCRIPT = """
    <script>
        $('#dir_list button').click(function() {
            const query = $(this).attr('name');
            var id = $(this).attr('id');

            if (id == 'next_dir') {
                $.ajax({
                    url: "ajax/open_dir/",
                    data:{query:query},
                    success:function(data) {
                        $('#backup_dir').html(data);
                    }
                });
            }
        });
        
        $('#dir_list button').dblclick(function() {
            const query = $(this).attr('name');
            var id = $(this).attr('id');

            if (id == 'open_file') {
                $.ajax({
                    url: "ajax/open_/",
                    data:{query:query},
                });
            }
        });
        
        $('#back').click(function() {
            const query = $(this).attr('name');

            $.ajax({
                url: "ajax/open_dir/",
                data:{query:query},
                success:function(data) {
                    $('#backup_dir').html(data);
                }
            });
        });
    </script>
    """
DARK_LIST_FILE = '<button type="button" class="list-group-item list-group-item-action list-group-item-dark"' \
                 ' id="open_file" name="{}/{}">{} <span class="badge badge-pill badge-dark size-badge">{} {}</span>' \
                 '</button>'
NORMAL_LIST_FILE = '<button type="button" class="list-group-item list-group-item-action" id="open_file" ' \
                   'name="{}/{}">{} <span class="badge badge-pill badge-dark size-badge">{} {}</span></button>'
DARK_LIST_FOLDER = '<button type="button" class="list-group-item list-group-item-action list-group-item-dark"' \
                   ' id="next_dir" name="{}/{}"><i class="fas fa-folder-open"></i> {}' \
                   '<span class="badge badge-pill badge-dark size-badge">{} {}</span></button>'
NORMAL_LIST_FOLDER = '<button type="button" class="list-group-item list-group-item-action" id="next_dir" ' \
                     'name="{}/{}"><i class="fas fa-folder-open"></i> {}' \
                     '<span class="badge badge-pill badge-dark size-badge">{} {}</span></button>'
CURRENT_DIR = '<a href="#" class="fas fa-chevron-circle-left back-button" id="back"' \
              ' name="'
DIR_NEXT_LIST = """
    <script>
        $(document).ready(function(){
            $('.custom-control-input').change(function () {
                let id = $(this).attr('id');
                label = $('#label-file-list-div');
                label.removeClass('text-success').removeClass('text-danger');
                ftp_list_hidden = $('#ftp-list-hidden');
                ftp_list_hidden.removeClass('is-invalid').removeClass('is-valid');

                if (id.startsWith('\\.')) {
                    id = '\\\\' + id;
                }
                if (!id.includes('switch')) {
                    if ($('#' + id).is(':checked')) {
                        $('#' + id + '_switch1').prop('disabled', false);
                        $('#' + id + '_switch2').prop('disabled', false);
                        label.addClass('text-success');
                        ftp_list_hidden.addClass('is-valid');
                    } else {
                        $('#' + id + '_switch1').prop('checked', false); 
                        $('#' + id + '_switch2').prop('checked', false); 
                        $('#' + id + '_switch1').prop('disabled', true);
                        $('#' + id + '_switch2').prop('disabled', true);
                    }
                }
            });
        });
    </script>
"""
DIR_LIST = """
    <div class="custom-control custom-checkbox col-md-2">
        <input type="checkbox" class="custom-control-input" id="{}">
        <label class="custom-control-label" for="{}">{}</label>
    </div>
    <div class="custom-control custom-switch col-md-1">
        <input type="checkbox" class="custom-control-input" id="{}_switch1" disabled>
        <label class="custom-control-label" for="{}_switch1"><i class='fas fa-calendar-alt' 
        title='Switch this on if you want folders with year and month of creation created for backing up files'></i>
        </label>
    </div>
    <div class="custom-control custom-switch col-md-1">
        <input type="checkbox" class="custom-control-input" id="{}_switch2" disabled>
        <label class="custom-control-label" for="{}_switch2"><i class='fas fa-sitemap' 
        title='Switch this on if you want folders within the selected folders to be backed up as one folder only'></i></label>
    </div>
"""
DIV_LIST_TWO = """
                    <div class="list-group-item"> 
                        <li class="fas fa-sitemap" title='Folders within the selected folders to be backed up as
                         one folder only'></li>
                        <a>{}</a>
                    </div>
                """
DIV_LIST_ONE = """
                    <div class="list-group-item">
                        <li class=" fas fa-calendar-alt" title='Folders with year and month of creation are created for 
                        backing up files'></li>
                        <a>{}</a>
                    </div>
                """
DIV_LIST_BOTH = """
                    <div class="list-group-item">
                        <li class=" fas fa-calendar-alt" title='Folders with year and month of creation are created for 
                        backing up files'></li>
                        <li class="fas fa-sitemap" title='Folders within the selected folders to be backed up as
                         one folder only'></li>
                        <a>{}</a>
                    </div>
                """
