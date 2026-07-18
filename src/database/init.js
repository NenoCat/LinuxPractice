// 数据库初始化脚本，包含常用Linux命令和实用题目

export function getInitSQL() {
  return `
    -- 创建commands表
    CREATE TABLE IF NOT EXISTS commands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      command TEXT NOT NULL,
      description TEXT NOT NULL,
      usage TEXT,
      category TEXT NOT NULL
    );

    -- 创建questions表
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('choice', 'fill')),
      command_id INTEGER,
      question_text TEXT NOT NULL,
      options TEXT,
      correct_answer TEXT NOT NULL,
      explanation TEXT,
      difficulty TEXT NOT NULL DEFAULT '中级' CHECK(difficulty IN ('初级', '中级', '高级')),
      FOREIGN KEY (command_id) REFERENCES commands(id)
    );

    -- 插入commands数据 - 文件操作
    INSERT INTO commands (command, description, usage, category) VALUES
    ('ls', '列出目录内容', 'ls [选项] [目录]', '文件操作'),
    ('find', '查找文件和目录', 'find [路径] [选项] [表达式]', '文件操作'),
    ('grep', '搜索文件内容', 'grep [选项] 模式 [文件...]', '文件操作'),
    ('chmod', '修改文件权限', 'chmod [选项] 权限 文件', '文件操作'),
    ('cp', '复制文件或目录', 'cp [选项] 源 目标', '文件操作'),
    ('mv', '移动或重命名文件', 'mv [选项] 源 目标', '文件操作');

    -- 插入commands数据 - 系统管理
    INSERT INTO commands (command, description, usage, category) VALUES
    ('ps', '显示进程状态', 'ps [选项]', '系统管理'),
    ('top', '实时显示进程信息', 'top [选项]', '系统管理'),
    ('df', '显示文件系统磁盘空间使用情况', 'df [选项] [文件]', '系统管理'),
    ('du', '显示目录或文件的磁盘使用量', 'du [选项] [文件或目录]', '系统管理'),
    ('kill', '终止进程', 'kill [选项] PID', '系统管理');

    -- 插入commands数据 - 网络操作
    INSERT INTO commands (command, description, usage, category) VALUES
    ('curl', '传输数据的命令行工具', 'curl [选项] URL', '网络操作'),
    ('wget', '下载文件', 'wget [选项] URL', '网络操作'),
    ('netstat', '显示网络连接状态', 'netstat [选项]', '网络操作');

    -- 插入commands数据 - 文本处理
    INSERT INTO commands (command, description, usage, category) VALUES
    ('sed', '流编辑器，用于文本替换和编辑', 'sed [选项] 命令 [文件]', '文本处理'),
    ('awk', '文本处理工具', 'awk [选项] 程序 [文件]', '文本处理'),
    ('sort', '对文本行进行排序', 'sort [选项] [文件]', '文本处理'),
    ('tar', '打包和解包文件', 'tar [选项] [文件]', '压缩归档');

    -- 插入commands数据 - 用户与权限
    INSERT INTO commands (command, description, usage, category) VALUES
    ('sudo', '以超级用户权限执行命令', 'sudo [选项] 命令', '用户与权限'),
    ('su', '切换用户身份', 'su [选项] [用户名]', '用户与权限'),
    ('useradd', '创建新用户账户', 'useradd [选项] 用户名', '用户与权限'),
    ('passwd', '设置或更改用户密码', 'passwd [选项] [用户名]', '用户与权限'),
    ('chown', '更改文件所有者和所属组', 'chown [选项] 所有者:组 文件', '用户与权限');

    -- 插入commands数据 - 管道与重定向
    INSERT INTO commands (command, description, usage, category) VALUES
    ('pipe(|)', '管道操作，将一个命令的输出作为另一个命令的输入', '命令1 | 命令2', '管道与重定向'),
    ('redirect(>)', '重定向操作，将命令输出写入文件', '命令 > 文件', '管道与重定向'),
    ('tee', '从标准输入读取数据，同时输出到标准输出和文件', 'tee [选项] 文件', '管道与重定向'),
    ('xargs', '从标准输入构建并执行命令', 'xargs [选项] 命令', '管道与重定向');

    -- 插入commands数据 - 进程与服务
    INSERT INTO commands (command, description, usage, category) VALUES
    ('systemctl', '管理系统服务', 'systemctl [选项] 命令 [服务]', '进程与服务'),
    ('nohup', '忽略挂断信号运行命令', 'nohup 命令 [参数] &', '进程与服务'),
    ('jobs', '显示后台作业', 'jobs [选项]', '进程与服务'),
    ('bg', '将作业放到后台运行', 'bg [作业号]', '进程与服务'),
    ('fg', '将作业放到前台运行', 'fg [作业号]', '进程与服务');

    -- 插入questions数据 - ls (id:1)
    INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES
    ('choice', 1, '要查看当前目录下所有隐藏文件（包括.开头的文件），应该使用哪个命令？', '["ls", "ls -a", "ls -l", "ls -h"]', 'ls -a', 'ls -a 选项可以显示所有文件，包括隐藏文件（以.开头的文件）。这是实际工作中常用的命令。', '初级'),
    ('choice', 1, '要查看文件的详细信息（权限、大小、修改时间等），应该使用哪个命令？', '["ls", "ls -a", "ls -l", "ls -t"]', 'ls -l', 'ls -l 可以显示文件的详细信息，包括权限、所有者、大小、修改时间等，是日常工作中最常用的选项之一。', '初级'),
    ('choice', 1, '要按文件修改时间排序显示文件，应该使用哪个命令？', '["ls", "ls -a", "ls -l", "ls -lt"]', 'ls -lt', 'ls -lt 可以按修改时间倒序排列，最新修改的文件在最前面，这在查找最近修改的文件时非常有用。', '中级'),
    ('fill', 1, '要递归列出当前目录及其所有子目录的内容，命令是：___', NULL, 'ls -R', 'ls -R 可以递归列出所有子目录的内容，R表示递归，适用于查看整个目录树结构。', '中级');

    -- 插入questions数据 - find (id:2)
    INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES
    ('choice', 2, '要查找当前目录及其子目录下所有.txt文件，应该使用哪个命令？', '["find . -name *.txt", "find . -name \\"*.txt\\"", "find . -type f -name txt", "find *.txt"]', 'find . -name "*.txt"', 'find . -name "*.txt" 可以递归查找所有.txt文件。注意通配符需要用引号括起来，避免shell扩展。', '中级'),
    ('choice', 2, '要查找大于100MB的文件，应该使用哪个命令？', '["find . -size +100M", "find . -size 100M", "find . -size -100M", "find . -size 100"]', 'find . -size +100M', 'find . -size +100M 可以查找大于100MB的文件，+表示大于，-表示小于。', '中级'),
    ('fill', 2, '要查找/var/log目录下所有.log文件中包含"error"的行，并显示行号，命令是：___', NULL, 'grep -rn "error" /var/log/*.log', 'grep -rn 可以递归搜索并显示行号，r表示递归，n表示显示行号。实际工作中查找日志错误时常用此命令。', '中级'),
    ('fill', 2, '要查找当前目录下所有大于50MB的文件，命令是：___', NULL, 'find . -size +50M', 'find -size +50M 可以查找大于指定大小的文件，+表示大于，M表示MB单位。', '中级'),
    ('fill', 2, '要查找7天前修改的文件，命令是：___', NULL, 'find . -mtime +7', 'find -mtime +7 可以查找7天前修改的文件，+7表示7天前，-7表示7天内。', '中级'),
    ('fill', 2, '要查找当前目录下所有目录（不包括文件），命令是：___', NULL, 'find . -type d', 'find -type d 可以只查找目录，-type f 查找文件，这是文件系统管理的常用方法。', '中级');

    -- 插入questions数据 - grep (id:3)
    INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES
    ('choice', 3, '要在文件中搜索包含"error"的行，并显示行号，应该使用哪个命令？', '["grep error file", "grep -n error file", "grep -r error file", "grep -i error file"]', 'grep -n error file', 'grep -n 可以显示匹配行的行号，这在调试和定位问题时非常有用。', '初级'),
    ('choice', 3, '要递归搜索目录下所有文件中包含"error"的内容，应该使用哪个命令？', '["grep error dir", "grep -n error dir", "grep -r error dir", "grep -i error dir"]', 'grep -r error dir', 'grep -r 可以递归搜索目录下的所有文件，这是查找日志文件或代码中特定内容时的常用方法。', '中级'),
    ('fill', 3, '要在当前目录及子目录中搜索包含"TODO"的行，但排除.log文件，命令是：___', NULL, 'grep -r "TODO" . --exclude="*.log"', 'grep --exclude 可以排除特定类型的文件，这在搜索代码时排除日志文件非常有用。', '高级'),
    ('fill', 3, '要搜索文件中不包含"debug"的行，命令是：___', NULL, 'grep -v "debug" file', 'grep -v 可以反向匹配，显示不包含指定模式的行，v表示invert match。', '中级');

    -- 插入questions数据 - chmod (id:4)
    INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES
    ('choice', 4, '要将文件权限设置为755（所有者可读写执行，组和其他用户可读执行），应该使用哪个命令？', '["chmod 755 file", "chmod u+rwx file", "chmod 644 file", "chmod +x file"]', 'chmod 755 file', 'chmod 755 是设置可执行文件权限的标准方式，7=rwx(所有者)，5=r-x(组和其他用户)。', '中级'),
    ('choice', 4, '要给文件所有者添加执行权限，应该使用哪个命令？', '["chmod 755 file", "chmod u+x file", "chmod +x file", "chmod 644 file"]', 'chmod u+x file', 'chmod u+x 使用符号方式给所有者添加执行权限，u表示所有者，+x表示添加执行权限。', '初级'),
    ('fill', 4, '要递归修改目录及其所有子文件和子目录的权限为755，命令是：___', NULL, 'chmod -R 755 dir', 'chmod -R 可以递归修改目录及其所有内容的权限，R表示递归，常用于统一设置项目目录权限。', '中级');

    -- 插入questions数据 - cp (id:5)
    INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES
    ('choice', 5, '要复制整个目录及其内容到另一个位置，需要使用哪个选项？', '["cp -p", "cp -r", "cp -f", "cp -i"]', 'cp -r', 'cp -r 可以递归复制目录及其所有内容，r表示递归，这是复制目录必须使用的选项。', '初级'),
    ('fill', 5, '要复制目录及其所有内容到另一个位置，命令是：___', NULL, 'cp -r source dest', 'cp -r 可以递归复制目录及其所有内容，r表示递归，这是备份目录的常用方法。', '初级'),
    ('fill', 5, '要复制文件并保留所有属性（权限、时间戳等），命令是：___', NULL, 'cp -p file dest', 'cp -p 可以保留文件的所有属性，包括权限、时间戳、所有者等，这在备份时非常有用。', '中级');

    -- 插入questions数据 - mv (id:6)
    INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES
    ('choice', 6, 'mv命令的主要功能是什么？', '["只复制文件", "移动或重命名文件", "删除文件", "创建文件链接"]', '移动或重命名文件', 'mv命令既可以移动文件到另一个目录，也可以在同一目录下重命名文件，是Linux中基本的文件操作命令。', '初级'),
    ('fill', 6, '要重命名文件old.txt为new.txt，命令是：___', NULL, 'mv old.txt new.txt', 'mv 命令既可以移动文件也可以重命名文件，这是Linux中重命名的标准方法。', '初级'),
    ('fill', 6, '要移动所有.log文件到/var/log/目录，命令是：___', NULL, 'mv *.log /var/log/', 'mv 配合通配符可以批量移动文件，这是日志整理的常用操作。', '中级');

    -- 插入questions数据 - ps (id:7)
    INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES
    ('choice', 7, '要查看所有进程的完整信息，应该使用哪个命令？', '["ps", "ps -ef", "ps aux", "ps -aux"]', 'ps aux', 'ps aux 可以显示所有进程的详细信息，包括CPU和内存使用情况，是系统管理中最常用的命令之一。', '中级'),
    ('choice', 7, '要查找名为"nginx"的进程，应该使用哪个命令？', '["ps | grep nginx", "ps -ef | grep nginx", "ps aux | grep nginx", "以上都可以"]', '以上都可以', '实际工作中，ps -ef | grep nginx 和 ps aux | grep nginx 都可以用来查找进程，都是常用的方法。', '中级'),
    ('fill', 7, '要以树形结构显示进程之间的父子关系，命令是：___', NULL, 'ps -ef --forest', 'ps -ef --forest 可以以树形结构显示进程，便于理解进程之间的层级关系，排查服务启动问题时常使用。', '高级');

    -- 插入questions数据 - top (id:8)
    INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES
    ('choice', 8, '在top命令交互界面中，按哪个键可以按内存使用率排序？', '["按P键", "按M键", "按N键", "按T键"]', '按M键', '在top交互界面中，M键按内存使用率排序，P键按CPU排序，N键按PID排序，T键按时间排序。', '中级'),
    ('fill', 8, '要实时监控系统进程，按CPU使用率排序，命令是：___', NULL, 'top', 'top 命令可以实时显示进程信息，默认按CPU使用率排序，这是系统监控的常用工具。', '初级'),
    ('fill', 8, '要只监控指定用户username的进程，命令是：___', NULL, 'top -u username', 'top -u 可以只显示指定用户的进程，在多用户系统中排查某个用户的资源占用时很有用。', '中级');

    -- 插入questions数据 - df (id:9)
    INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES
    ('choice', 9, '要查看磁盘使用情况并以人类可读的格式显示（KB、MB、GB），应该使用哪个命令？', '["df", "df -h", "df -a", "df -l"]', 'df -h', 'df -h 可以以人类可读的格式显示磁盘空间，这是日常检查磁盘使用情况的标准命令。', '初级'),
    ('fill', 9, '要查看指定目录所在分区的磁盘使用情况，命令是：___', NULL, 'df -h /path', 'df -h 后跟目录路径可以只显示该目录所在分区的磁盘信息，快速判断分区空间是否充足。', '中级'),
    ('fill', 9, '要查看文件系统类型（如ext4、tmpfs等），命令是：___', NULL, 'df -T', 'df -T 可以显示文件系统类型，T表示Type，在确认分区格式时非常有用。', '中级');

    -- 插入questions数据 - du (id:10)
    INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES
    ('choice', 10, '要查看当前目录的总大小（不显示子目录详情），应该使用哪个命令？', '["du", "du -sh", "du -h", "du -s"]', 'du -sh', 'du -sh 可以只显示当前目录的总大小，s表示汇总，h表示人类可读格式，是快速查看目录大小的标准命令。', '中级'),
    ('fill', 10, '要查看当前目录下各子目录的大小并按人类可读格式显示，命令是：___', NULL, 'du -h --max-depth=1', 'du -h --max-depth=1 可以显示一级子目录的大小，便于快速定位哪个子目录占用空间最大。', '中级'),
    ('fill', 10, '要查看指定目录的总磁盘使用量（人类可读格式），命令是：___', NULL, 'du -sh /path', 'du -sh 是查看目录大小的最常用组合，s表示汇总不递归显示子目录，h表示人类可读格式。', '初级'),
    ('fill', 10, '要找出当前目录下最大的10个文件，命令是：___', NULL, 'du -ah . | sort -rh | head -10', 'du -ah列出所有文件大小，sort -rh按数值倒序排列，head -10取前10个，这是排查磁盘占用的常用组合。', '高级');

    -- 插入questions数据 - kill (id:11)
    INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES
    ('choice', 11, 'kill -9 发送的是什么信号？', '["SIGTERM", "SIGKILL", "SIGHUP", "SIGINT"]', 'SIGKILL', 'kill -9 发送SIGKILL信号，这是强制终止信号，进程无法捕获或忽略，应作为最后手段使用。', '中级'),
    ('fill', 11, '要强制终止进程ID为1234的进程，命令是：___', NULL, 'kill -9 1234', 'kill -9 可以强制终止进程，-9是SIGKILL信号，无法被进程捕获或忽略，用于强制结束无响应的进程。', '中级'),
    ('fill', 11, '要优雅地终止进程ID为5678的进程（发送SIGTERM信号），命令是：___', NULL, 'kill -15 5678', 'kill -15 发送SIGTERM信号，允许进程进行清理后退出，比kill -9更安全，是推荐使用的终止方式。', '高级');

    -- 插入questions数据 - curl (id:12)
    INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES
    ('choice', 12, '要下载一个文件，应该使用哪个命令？', '["curl URL", "curl -O URL", "curl -o filename URL", "以上都可以"]', '以上都可以', 'curl -O 可以下载文件并保持原文件名，curl -o filename 可以指定保存的文件名，都是常用的下载方式。', '中级'),
    ('choice', 12, '要查看HTTP响应头信息，应该使用哪个命令？', '["curl URL", "curl -I URL", "curl -v URL", "curl -h URL"]', 'curl -I URL', 'curl -I 可以只获取HTTP响应头，这在调试API或检查服务器配置时非常有用。', '中级'),
    ('fill', 12, '要发送POST请求并传递JSON数据，命令是：___', NULL, 'curl -X POST -H "Content-Type: application/json" -d ''{"key":"value"}'' URL', 'curl -X POST 可以发送POST请求，-H设置请求头，-d传递数据，这是API测试的常用方法。', '高级');

    -- 插入questions数据 - wget (id:13)
    INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES
    ('choice', 13, 'wget和curl的主要区别是什么？', '["wget只能下载，curl功能更多", "curl只能上传，wget只能下载", "没有区别", "wget支持更多协议"]', 'wget只能下载，curl功能更多', 'wget主要用于下载文件，支持断点续传和递归下载；curl功能更丰富，支持多种协议和数据传输方式。', '中级'),
    ('fill', 13, '要下载文件并保存为指定文件名，命令是：___', NULL, 'wget -O filename URL', 'wget -O 可以指定下载文件的保存名称，这在下载文件需要重命名时非常有用。', '初级'),
    ('fill', 13, '要断点续传下载文件，命令是：___', NULL, 'wget -c URL', 'wget -c 可以断点续传，如果下载中断，可以继续从断点处下载，这对于大文件下载非常有用。', '中级');

    -- 插入questions数据 - netstat (id:14)
    INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES
    ('choice', 14, '要查看所有监听的端口，应该使用哪个命令？', '["netstat -a", "netstat -l", "netstat -tlnp", "netstat -an"]', 'netstat -tlnp', 'netstat -tlnp 可以显示所有TCP监听端口及其对应的进程，这是检查端口占用情况的标准命令。', '中级'),
    ('fill', 14, '要查看占用8080端口的进程，命令是：___', NULL, 'netstat -tlnp | grep 8080', 'netstat -tlnp | grep 8080 可以查找占用特定端口的进程，这在排查端口冲突时非常有用。也可以使用 lsof -i :8080。', '中级'),
    ('fill', 14, '要查看所有网络连接的统计信息，命令是：___', NULL, 'netstat -s', 'netstat -s 可以显示网络统计信息，包括各协议的收发包数量，用于分析网络性能问题。', '高级');

    -- 插入questions数据 - sed (id:15)
    INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES
    ('choice', 15, '要替换文件中所有的"old"为"new"，应该使用哪个命令？', '["sed s/old/new/g file", "sed ''s/old/new/g'' file", "sed s/old/new file", "sed replace old new file"]', 'sed ''s/old/new/g'' file', 'sed ''s/old/new/g'' 可以替换文件中所有匹配的内容，g表示全局替换，这是文本批量处理的常用方法。', '中级'),
    ('fill', 15, '要删除文件中包含"delete"的行，命令是：___', NULL, 'sed -i ''/delete/d'' file', 'sed -i ''/pattern/d'' 可以删除匹配的行，-i表示直接修改文件，这是批量清理文件的常用方法。', '中级'),
    ('fill', 15, '要在文件中指定行号（如第10行）后插入一行文本"new line"，命令是：___', NULL, 'sed -i ''10a\\new line'' file', 'sed的a命令可以在指定行后追加文本，10a表示在第10行后追加，这是脚本化编辑文件的常用方法。', '高级');

    -- 插入questions数据 - awk (id:16)
    INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES
    ('choice', 16, '要提取文件的第一列和第三列，应该使用哪个命令？', '["awk ''{print $1,$3}'' file", "awk ''{print $1 $3}'' file", "awk ''{print $1,$2}'' file", "awk ''{print 1,3}'' file"]', 'awk ''{print $1,$3}'' file', 'awk ''{print $1,$3}'' 可以提取指定列，$1表示第一列，$3表示第三列，这是处理表格数据的常用方法。', '中级'),
    ('fill', 16, '要统计文件中每行的第一列出现的次数，命令是：___', NULL, 'awk ''{print $1}'' file | sort | uniq -c', 'awk提取第一列，sort排序，uniq -c统计次数，这是数据统计分析的常用组合命令。', '中级'),
    ('fill', 16, '要计算文件第三列数值的总和，命令是：___', NULL, 'awk ''{sum+=$3} END{print sum}'' file', 'awk可以逐行累加指定列的值，END块在所有行处理完后输出结果，这是日志和数据统计的常用方法。', '高级');

    -- 插入questions数据 - sort (id:17)
    INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES
    ('choice', 17, '要对文件按第2列进行排序，应该使用哪个命令？', '["sort file", "sort -k2 file", "sort -n file", "sort -r file"]', 'sort -k2 file', 'sort -k2 按第2列排序，k表示key，这是处理多列数据排序的常用方法。', '中级'),
    ('fill', 17, '要对文件进行数值排序（而不是字符串排序），命令是：___', NULL, 'sort -n file', 'sort -n 可以按数值大小排序，而不是按字符串排序，这在处理数字数据时非常重要。', '初级'),
    ('fill', 17, '要对文件内容去重排序，命令是：___', NULL, 'sort file | uniq', 'sort排序后再用uniq去重，uniq只能处理相邻的重复行，所以必须先排序。', '中级');

    -- 插入questions数据 - tar (id:18)
    INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES
    ('choice', 18, '要打包并压缩目录为tar.gz格式，应该使用哪个命令？', '["tar -czf archive.tar.gz dir", "tar -cf archive.tar.gz dir", "tar -xzf archive.tar.gz", "tar -zcf archive.tar.gz dir"]', 'tar -czf archive.tar.gz dir', 'tar -czf 可以创建压缩的tar包，c表示创建，z表示gzip压缩，f指定文件名，这是备份和分发文件的常用方法。', '中级'),
    ('fill', 18, '要解压tar.gz文件到指定目录，命令是：___', NULL, 'tar -xzf archive.tar.gz -C /target/dir', 'tar -xzf 可以解压tar.gz文件，-C指定解压目录，这是部署和恢复备份的常用方法。', '中级'),
    ('fill', 18, '要不压缩仅打包目录为tar格式，命令是：___', NULL, 'tar -cf archive.tar dir', 'tar -cf 只打包不压缩，c表示创建，f指定文件名。对于已经是压缩格式的文件，避免二次压缩可节省时间。', '初级');

    -- 插入questions数据 - sudo (id:19)
    INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES
    ('choice', 19, 'sudo命令的主要作用是什么？', '["切换到root用户", "以超级用户或其他用户身份执行命令", "修改用户密码", "创建新用户"]', '以超级用户或其他用户身份执行命令', 'sudo允许普通用户以超级用户或其他用户身份执行命令，执行时需要输入当前用户密码，比直接使用root更安全。', '初级'),
    ('choice', 19, '要以用户www-data的身份执行命令，应该使用哪个选项？', '["sudo -u www-data command", "sudo -U www-data command", "sudo -g www-data command", "sudo -as www-data command"]', 'sudo -u www-data command', 'sudo -u 可以指定以哪个用户的身份执行命令，这在以特定服务账户运行程序时很有用。', '中级'),
    ('fill', 19, '要以root身份编辑/etc/hosts文件，命令是：___', NULL, 'sudo vim /etc/hosts', 'sudo配合编辑器可以修改系统配置文件，因为/etc/hosts等系统文件只有root才有写入权限。', '初级'),
    ('fill', 19, '要查看sudo的执行日志，命令是：___', NULL, 'sudo cat /var/log/auth.log', 'sudo的执行记录通常保存在/var/log/auth.log（Debian系）或/var/log/secure（RedHat系）中。', '高级');

    -- 插入questions数据 - su (id:20)
    INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES
    ('choice', 20, 'su和sudo的主要区别是什么？', '["没有区别", "su切换到另一个用户shell，sudo以其他用户身份执行单条命令", "su更安全", "sudo需要root密码"]', 'su切换到另一个用户shell，sudo以其他用户身份执行单条命令', 'su是切换用户身份并进入新的shell环境，需要目标用户密码；sudo是以其他用户身份执行单条命令，需要当前用户密码。', '中级'),
    ('fill', 20, '要切换到root用户并获得完整的环境变量，命令是：___', NULL, 'su -', 'su - 或 su -l 可以模拟完整登录，加载目标用户的所有环境变量和配置文件，避免因环境变量缺失导致命令找不到的问题。', '中级'),
    ('fill', 20, '要切换到用户deploy，命令是：___', NULL, 'su - deploy', 'su - deploy 可以切换到deploy用户并加载其完整环境，这是运维中切换到服务账户的常用方式。', '初级');

    -- 插入questions数据 - useradd (id:21)
    INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES
    ('choice', 21, 'useradd和adduser命令的区别是什么？', '["完全相同", "useradd是底层命令，adduser是交互式前端脚本", "adduser更底层", "useradd只能在RedHat系统使用"]', 'useradd是底层命令，adduser是交互式前端脚本', 'useradd是系统底层的添加用户命令，需要手动指定所有参数；adduser在Debian系中是交互式脚本，会引导输入密码等信息。', '中级'),
    ('fill', 21, '要创建用户dev并指定其home目录为/home/dev，命令是：___', NULL, 'useradd -m -d /home/dev dev', 'useradd -m创建用户并建立home目录，-d指定home目录路径，-m确保目录被创建。', '中级'),
    ('fill', 21, '要创建用户deploy并指定其登录shell为/bin/bash，命令是：___', NULL, 'useradd -s /bin/bash deploy', 'useradd -s 可以指定用户的登录shell，某些系统默认shell可能不是bash，需要显式指定。', '中级'),
    ('fill', 21, '要创建用户appuser并添加到www组作为附加组，命令是：___', NULL, 'useradd -G www appuser', 'useradd -G 可以指定用户的附加组（supplementary group），一个用户可以属于多个附加组。', '高级');

    -- 插入questions数据 - passwd (id:22)
    INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES
    ('choice', 22, '要锁定用户账户使其无法登录，应该使用哪个命令？', '["passwd -l username", "passwd -d username", "passwd -e username", "passwd -x username"]', 'passwd -l username', 'passwd -l 可以锁定用户账户，在密码前添加!标记使其无效。要解锁使用passwd -u。', '中级'),
    ('fill', 22, '要修改当前用户的密码，命令是：___', NULL, 'passwd', '直接输入passwd可以修改当前用户的密码，系统会提示输入旧密码和新密码。', '初级'),
    ('fill', 22, '要强制用户admin在下次登录时修改密码，命令是：___', NULL, 'passwd -e admin', 'passwd -e 可以使密码立即过期，强制用户下次登录时必须修改密码，这是新用户安全策略的常用设置。', '高级');

    -- 插入questions数据 - chown (id:23)
    INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES
    ('choice', 23, '要将文件所有者改为www、所属组改为www-group，应该使用哪个命令？', '["chown www:www-group file", "chown www/www-group file", "chown www.www-group file", "chown -g www-group -u www file"]', 'chown www:www-group file', 'chown 使用 owner:group 格式同时修改所有者和所属组，用冒号分隔，这是标准的语法格式。', '中级'),
    ('fill', 23, '要递归修改目录及所有子文件的所有者为nginx，命令是：___', NULL, 'chown -R nginx dir', 'chown -R 可以递归修改目录及其所有内容的所有者，这是设置Web目录权限的常用操作。', '中级'),
    ('fill', 23, '要只修改文件的所属组为docker而不改变所有者，命令是：___', NULL, 'chown :docker file', 'chown :group 只修改所属组，冒号前留空表示不改变所有者。也可以使用chgrp命令达到同样效果。', '高级'),
    ('fill', 23, '要将项目目录所有者改为deploy用户和deploy组，命令是：___', NULL, 'chown -R deploy:deploy /project', 'chown -R deploy:deploy 递归修改目录所有者和组，这是部署项目时设置文件权限的标准操作。', '初级');

    -- 插入questions数据 - pipe(|) (id:24)
    INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES
    ('choice', 24, '管道符|的作用是什么？', '["将前一个命令的输出作为后一个命令的输入", "同时执行两个命令", "将前一个命令的输出写入文件", "逻辑或运算"]', '将前一个命令的输出作为后一个命令的输入', '管道符|是Linux中最强大的特性之一，它可以将一个命令的标准输出直接传递给下一个命令的标准输入，实现命令的组合。', '初级'),
    ('fill', 24, '要统计当前目录下文件数量，命令是：___', NULL, 'ls | wc -l', 'ls列出文件，wc -l统计行数，通过管道组合可以快速得到文件数量。', '初级'),
    ('fill', 24, '要查找占用80端口的进程，命令是：___', NULL, 'netstat -tlnp | grep :80', 'netstat -tlnp列出所有监听端口，通过管道传给grep过滤出80端口，这是排查端口占用的经典组合。', '中级'),
    ('fill', 24, '要查看history中最近使用的git命令，命令是：___', NULL, 'history | grep git', 'history输出命令历史，通过管道传给grep过滤包含git的行，快速查找特定命令的使用记录。', '中级');

    -- 插入questions数据 - redirect(>) (id:25)
    INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES
    ('choice', 25, '>>和>重定向的区别是什么？', '[">>是追加重定向，>是覆盖重定向", ">是追加重定向，>>是覆盖重定向", "没有区别", ">>用于输入重定向"]', '>>是追加重定向，>是覆盖重定向', '>会覆盖目标文件的原有内容，>>会在文件末尾追加内容而不覆盖，在日志记录等场景中>>更常用。', '初级'),
    ('fill', 25, '要将命令输出追加到log.txt文件中，命令是：___', NULL, 'command >> log.txt', '>>是追加重定向，不会覆盖文件原有内容，适合日志记录和结果累积的场景。', '初级'),
    ('fill', 25, '要将命令的错误输出重定向到error.log文件，命令是：___', NULL, 'command 2> error.log', '2> 是标准错误重定向，2表示标准错误流(stderr)。0是标准输入，1是标准输出，2是标准错误。', '中级');

    -- 插入questions数据 - tee (id:26)
    INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES
    ('choice', 26, 'tee命令的主要作用是什么？', '["只将输入写入文件", "从标准输入读取并同时输出到标准输出和文件", "合并多个文件", "创建临时文件"]', '从标准输入读取并同时输出到标准输出和文件', 'tee就像管道中的T型接头，数据从一端进入，分成两路输出：一路到标准输出（屏幕），一路到文件。', '中级'),
    ('fill', 26, '要将命令输出同时显示在屏幕上并保存到output.log，命令是：___', NULL, 'command | tee output.log', 'tee可以在看到输出结果的同时保存到文件，这在调试和记录长时间运行的命令输出时非常有用。', '中级'),
    ('fill', 26, '要将命令输出追加到已有文件中同时显示在屏幕上，命令是：___', NULL, 'command | tee -a output.log', 'tee -a 是追加模式，不会覆盖文件原有内容，类似于>>的追加效果，同时保持屏幕输出。', '中级');

    -- 插入questions数据 - xargs (id:27)
    INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES
    ('choice', 27, 'xargs命令的主要作用是什么？', '["将标准输入转换为命令行参数", "执行循环操作", "替换文本内容", "连接多个命令"]', '将标准输入转换为命令行参数', 'xargs从标准输入读取数据，将其转换为指定命令的命令行参数，解决了某些命令不能直接从管道读取输入的问题。', '中级'),
    ('fill', 27, '要查找所有.log文件并删除它们，命令是：___', NULL, 'find . -name "*.log" | xargs rm', 'find找到的文件列表通过xargs传递给rm命令作为参数，比find -exec更高效，特别是在文件数量很多时。', '中级'),
    ('fill', 27, '要查找所有.jpg文件并复制到/backup目录，命令是：___', NULL, 'find . -name "*.jpg" | xargs -I {} cp {} /backup', 'xargs -I {} 可以指定替换符号{}，每个找到的文件路径会替换{}，从而正确传递给cp命令。', '高级');

    -- 插入questions数据 - systemctl (id:28)
    INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES
    ('choice', 28, '要查看nginx服务的当前状态，应该使用哪个命令？', '["systemctl status nginx", "systemctl show nginx", "systemctl info nginx", "systemctl check nginx"]', 'systemctl status nginx', 'systemctl status 是查看服务状态的标准命令，会显示服务是否运行、PID、内存占用等信息。', '初级'),
    ('choice', 28, '要设置nginx服务开机自启动，应该使用哪个命令？', '["systemctl start nginx", "systemctl enable nginx", "systemctl autostart nginx", "systemctl init nginx"]', 'systemctl enable nginx', 'systemctl enable 会创建符号链接使服务在开机时自动启动。start只是立即启动，不会设置开机自启。', '中级'),
    ('fill', 28, '要重启nginx服务，命令是：___', NULL, 'systemctl restart nginx', 'systemctl restart 可以重启服务，先停止再启动。修改配置文件后通常需要重启服务使配置生效。', '初级'),
    ('fill', 28, '要重新加载nginx配置而不中断服务，命令是：___', NULL, 'systemctl reload nginx', 'systemctl reload 可以平滑重载配置文件，不会中断现有连接，比restart更优雅，适合生产环境。', '高级');

    -- 插入questions数据 - nohup (id:29)
    INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES
    ('choice', 29, 'nohup命令的作用是什么？', '["以后台方式运行命令", "忽略挂断信号使命令在退出终端后继续运行", "降低命令优先级", "设置命令超时时间"]', '忽略挂断信号使命令在退出终端后继续运行', 'nohup（no hang up）会忽略SIGHUP信号，使命令在用户退出终端后继续运行，输出默认重定向到nohup.out。', '中级'),
    ('fill', 29, '要在后台运行脚本并使其在退出终端后继续执行，命令是：___', NULL, 'nohup python app.py &', 'nohup忽略挂断信号，&将命令放到后台运行，两者组合是远程服务器上运行长时间任务的常用方式。', '中级'),
    ('fill', 29, '要将nohup运行脚本的输出重定向到指定日志文件，命令是：___', NULL, 'nohup python app.py > app.log 2>&1 &', 'nohup配合重定向可以将标准输出和标准错误都写入指定文件，2>&1将stderr重定向到stdout。', '高级');

    -- 插入questions数据 - jobs (id:30)
    INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES
    ('choice', 30, 'jobs命令显示的是什么信息？', '["所有系统进程", "当前shell会话中的后台作业", "定时任务", "所有用户的进程"]', '当前shell会话中的后台作业', 'jobs只显示当前shell会话中通过&或Ctrl+Z挂起的作业，不会显示其他终端或其他用户的进程。', '初级'),
    ('fill', 30, '要查看当前shell中所有后台作业及其进程ID，命令是：___', NULL, 'jobs -l', 'jobs -l 除了显示作业号和状态外，还会显示对应的进程ID（PID），方便对特定进程进行操作。', '中级'),
    ('fill', 30, '要查看当前shell中所有后台作业（包括正在运行和已停止的），命令是：___', NULL, 'jobs', 'jobs 命令会列出当前shell会话中的所有后台作业，包括运行中(Running)和已停止(Stopped)的作业。', '初级');

    -- 插入questions数据 - bg (id:31)
    INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES
    ('choice', 31, 'bg命令的作用是什么？', '["将前台作业放到后台并继续运行", "删除后台作业", "查看后台作业", "终止后台作业"]', '将前台作业放到后台并继续运行', 'bg将已停止(Ctrl+Z)的作业放到后台继续运行，使其不占用当前终端，同时恢复执行。', '中级'),
    ('fill', 31, '要将编号为2的已停止作业放到后台继续运行，命令是：___', NULL, 'bg %2', 'bg %2 将作业号为2的已停止作业放到后台运行，%后跟作业号来指定特定作业。', '中级'),
    ('fill', 31, '要将最近一个被Ctrl+Z停止的作业恢复到后台运行，命令是：___', NULL, 'bg', '不带参数的bg默认操作最近一个作业（带+标记的作业），这是最常用的方式。', '初级');

    -- 插入questions数据 - fg (id:32)
    INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES
    ('choice', 32, 'fg命令的作用是什么？', '["将后台作业调到前台运行", "在后台运行作业", "终止前台作业", "暂停当前作业"]', '将后台作业调到前台运行', 'fg将后台作业调回前台运行，使其占用当前终端，可以与之交互或接收输入。', '中级'),
    ('fill', 32, '要将编号为1的后台作业调到前台运行，命令是：___', NULL, 'fg %1', 'fg %1 将作业号为1的后台作业调到前台运行，%后跟作业号来指定特定作业。', '中级'),
    ('fill', 32, '要将最近一个后台作业调到前台运行，命令是：___', NULL, 'fg', '不带参数的fg默认操作最近一个作业（带+标记的作业），这是最简捷的使用方式。', '初级');
  `;
}
