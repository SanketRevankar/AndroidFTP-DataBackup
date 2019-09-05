import os
import platform

from django.http import JsonResponse, HttpResponse

from AndroidFTPBackup.conf.config import BACKUP_FOLDER


def get_file_count():
    # files = {}
    base = r'D:\Sanketsr\Backup'
    # for folder in os.listdir(base):
    #     if os.path.isdir(base + '\\' + folder):
    #         files[folder] = {}
    #         for f in os.listdir(base + '\\' + folder):
    #             if os.path.isdir(base + '\\' + folder + '\\' + f):
    #                 files[folder][f] = os.listdir(base + '\\' + folder + '\\' + f).__len__()
    # print(files)
    return os.walk(base)


def get_file_sizes(path):
    data = {}
    types = {
        'Images': ['dng', 'jpg', 'jpeg', 'png', 'bmp'],
        'Audio': ['aac', 'ogg', 'mp3', 'wav', 'amr', 'opus'],
        'Video': ['mp4', 'gif', '3gp', '3gpp', 'mkv'],
        'Documents': ['xlsx', 'pdf', 'doc', 'docx', 'pptx', 'txt'],
        'Apps': ['apk'],
        'Compressed': ['zip', 'rar'],
    }

    for a, b, c in os.walk(path):
        if c.__len__() != 0:
            for x in c:
                type_ = x.split('.')[-1].lower()
                if type_ in ['ini', 'tmp', 'dataulti', 'pic-store', 'crypt12', 'nomedia', 'vcs']:
                    continue
                size = os.path.getsize(a + '\\' + x)
                for t in types:
                    if type_ in types[t]:
                        if t not in data:
                            data[t] = {
                                'size': size,
                                'count': 1
                            }
                            break
                        else:
                            data[t]['size'] += size
                            data[t]['count'] += 1
                            break
                else:
                    if type_ not in data:
                        data[type_] = {
                            'size': size,
                            'count': 1
                        }
                    else:
                        data[type_]['size'] += size
                        data[type_]['count'] += 1

    data_list_space = [['Type', 'Size']]
    data_list_count = [['Type', 'Size']]

    total_size = 0
    for t in data:
        data_list_space.append([t, round(data[t]['size'] / 1024 / 1024 / 1024, 3)])
        data_list_count.append([t, data[t]['count']])
        total_size += data[t]['size']

    return data_list_space, data_list_count, round(total_size / 1024 / 1024 / 1024, 3)


def open_(request):
    path = BACKUP_FOLDER + '/' + request.GET.get('query')
    if platform.system() == "Windows":
        os.startfile(path)
    elif platform.system() == "Darwin":
        os.subprocess.Popen(["open_", path])
    else:
        os.subprocess.Popen(["xdg-open_", path])

    return JsonResponse({})


def open_dir(request):
    response = '<div class="list-group list-group-flush" id="dir_list" style="max-height: 75vh; overflow-y: auto    ">'
    response += '<li class="list-group-item list-group-item-action list-group-item-secondary" ' \
                'style="color: white; background: #3a3939; user-select: none;">'

    next_ = request.GET.get('query')
    if next_ != '':
        response += '<a href="#" style="margin-right: 2%; font-size: large; text-decoration: none !important;"' \
            ' class="fas fa-chevron-circle-left" id="back" name="' + '/'.join(str(next_).split('/')[:-1]) + '"></a>'

    path = BACKUP_FOLDER + next_
    response += path + '</li>'

    n = 0
    files = []
    for folder in os.listdir(path):
        if os.path.isfile(path + '/' + folder):
            files.append(folder)
            continue
        n += 1
        if n % 2 == 0:
            response += '<button type="button" class="list-group-item list-group-item-action list-group-item-dark"' \
                        ' id="next_dir" name="' + next_ + '/' + folder + '">' + folder + '</button>'
        else:
            response += '<button type="button" class="list-group-item list-group-item-action" ' \
                        ' id="next_dir" name="' + next_ + '/' + folder + '">' + folder + '</button>'

    for file in files:
        n += 1
        if n % 2 == 0:
            response += '<button type="button" class="list-group-item list-group-item-action list-group-item-dark"' \
                        ' id="open_file" name="' + next_ + '/' + file + '">' + file + '</button>'
        else:
            response += '<button type="button" class="list-group-item list-group-item-action" ' \
                        ' id="open_file" name="' + next_ + '/' + file + '">' + file + '</button>'

    response += '</div>'
    response += """
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
            } else if (id == 'open_file') {
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
    return HttpResponse(response)
