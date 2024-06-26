import React, { useEffect, useState } from "react";
import axios from "axios";
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css'
import { Breadcrumbs, Stack } from "@mui/material";
import Link from "@mui/material/Link";
import { TreeView } from "@mui/x-tree-view/TreeView";
import { TreeItem } from "@mui/x-tree-view";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MoveToDirDialog from "./components/MoveToDirDialog";
import SelectFolderDialog from "./components/SelectFolderDialog";
import ContextMenu from "./components/ContextMenu";
import CreateDirDialog from "./CreateDirDialog";
import StorageToolbar from "./components/StorageToolbar";
import TrashbinToolbar from "./components/TrashbinToolbar";
import { format } from 'date-fns';
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import TrashbinButton from "./components/TrashbinButton";
import { Archive, ArrowRight, AudioFile, CoPresent, Description, Image, HelpCenter, Notes, TableChart, VideoFile } from "@mui/icons-material";
import { ar, ca } from "date-fns/locale";
import StorageButton from "./components/StorageButton";

function Home(props) {
    const {userId} = props;

    const [files, setFiles] = useState([]);
    const [treeViewFiles, setTreeViewFiles] = useState([]);
    const [breadcrumbs, setBreadcrumbs] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);
    const [currentDirectory, setCurrentDirectory] = useState("");
    const [moveToDirDialogOpen, setMoveToDirDialogOpen] = useState(false);
    const [createDirDialogOpen, setCreateDirDialogOpen] = useState(false);
    const [contextMenu, setContextMenu] = useState(null);
    const [contextMenuDirOnly, setContextMenuDirOnly] = useState(false);
    const [isInTrashbin, setIsInTrashbin] = useState(false);

    const uploadFilesEndpoint = "http://localhost:8080/files/uploadMultiple?";
    const getFilesListEndpoint = "http://localhost:8080/files/get?";
    const getAllFilesListEndpoint = "http://localhost:8080/files/getAll?";
    const getFilesFromTrashbinEndpoint = "http://localhost:8080/trashbin/get?";
    const getByUserIdEndpoint = "http://localhost:8080/files/getByUserId?";
    const fileDownloadEndpoint = "http://localhost:8080/files/downloadMultiple?";
    const putToTrashbinEndpoint = "http://localhost:8080/trashbin/put?";
    const moveFileEndpoint = "http://localhost:8080/files/move?";
    const createDirectoryEndpoint = "http://localhost:8080/directory/create?";
    const restoreFileEndpoint = "http://localhost:8080/trashbin/restore?";
    const destroyFileEndpoint = "http://localhost:8080/trashbin/destroy?";

    useEffect(() => {
        loadFilesFromWorkDir();
        loadTreeViewFiles();
    }, []);

    // Добавление ссылки в навигационную цепочку:
    // Папка > Подпапка > Подподпапка
    const addBreadcrumb = (name, link) => {
        const newId = breadcrumbs.length + 1;
        breadcrumbs.push(
            <Link id={newId} path={link} className="breadcrumb-link" onClick={onBreadcrumbLinkClick}>{name}</Link>
        )
    }

    // Удаление элемента из навигационной цепочки
    const removeBreadcrumbs = (count) => {
        for (let index = 0; index < count; index++) {
            breadcrumbs.pop(index);
        }
    }

    const updateTable = () => {
        if (currentDirectory == "")
            loadFilesFromWorkDir();
        else
            openFolder(null, currentDirectory);
    }

    const updateTree = () => {
        loadTreeViewFiles();
    }

    const updatePage = () => {
        updateTable();
        updateTree();
    }

    // Определяет иконку элемента дерева навигации 
    // по типу файла
    const treeItemIcon = (file) => {
        switch (file.type) {
            case "DOCUMENT": return <Description/>;
            case "SPREADSHEET": return <TableChart/>;
            case "PRESENTATION": return <CoPresent/>;
            case "TEXT": return <Notes/>;
            case "AUDIO": return <AudioFile/>;
            case "VIDEO": return <VideoFile/>;
            case "IMAGE": return <Image/>;
            case "COMPRESSED": return <Archive/>;
            case "OTHER": return <HelpCenter/>;
        }
    }

    // Отрисовка узлов дерева навигации
    //
    // Параметры:
    //      nodes - дерево элементов, которые нужно отрисовать,
    //      onlyDirectories - блокировать все узлы, кроме папок
    const renderTreeItems = (nodes, onlyDirectories = false) => {
        if (Array.isArray(nodes)) {
            return nodes.map((node) =>
                <TreeItem key={node.id} nodeId={node.id} label={node.name}
                    disabled={onlyDirectories && !node.isDirectory}
                    endIcon={treeItemIcon(treeViewFiles[node.id])}>
                    {
                        // Если есть дочерние узлы...
                        Array.isArray(node.children)
                            //...отрисовать их
                            ? node.children.map((n) => renderTreeItems(n, onlyDirectories))
                            : null
                    }
                </TreeItem>
            );
        }
        else {
            return <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.name}
                        disabled={onlyDirectories && !nodes.isDirectory}
                        endIcon={treeItemIcon(treeViewFiles[nodes.id])}>
                        {
                        // Если есть дочерние узлы...
                            Array.isArray(nodes.children)
                                // ...отрисовать их
                                ? nodes.children.map((n) => renderTreeItems(n, onlyDirectories))
                                : null
                        }
                    </TreeItem>
        }
    }

    // Преобразование списка файлов в дерево файлов
    const getNodesFromFiles = (filesList) => {
        const treeOfFiles = [];
        const directoriesMapping = [];

        filesList.sort((f1, f2) => f1.path > f2.path);

        // Перебираем файлы
        let file;
        let dirIndex = 0;
        let newNode;
        for (let index = 0; index < filesList.length; index++) {
            file = filesList[index];

            // Проверяем вложенность
            // Если файл находится в рабочей директории
            if (file.path == "") {
                newNode = {id: index, name: file.name, isDirectory: false, children: []};
                treeOfFiles.push(newNode);

                // Если файл является папкой...
                if (file.type == "DIRECTORY") {
                    // ...добавляем в список папок
                    newNode.isDirectory = true;
                    directoriesMapping.push({ mappedNode: newNode, mappedFile: file });
                    dirIndex++;
                }   
            }
            // Если файл лежит в какой-либо папке
            else {
                let dir;
                let mapNode;
                let dirFullPath;
                // Перебираем список папок
                for (let j = 0; j < directoriesMapping.length; j++) {
                    dir = directoriesMapping[j].mappedFile;
                    mapNode = directoriesMapping[j].mappedNode;
                    dirFullPath = getFullFilePath(dir);

                    // Если данная папка является папкой текущего файла...
                    if (file.path == dirFullPath) {
                        // ...добавляем его как дочерний объект для папки
                        newNode = {id: index, name: file.name, isDirectory: false, children: []};
                        mapNode.children.push(newNode);

                        // Если файл является папкой...
                        if (file.type == "DIRECTORY") {
                            // ...добавляем в список папок
                            newNode.isDirectory = true;
                            directoriesMapping.push({ mappedNode: newNode, mappedFile: file });
                            dirIndex++;
                        }   
                    }
                }
            }
        }

        return treeOfFiles;
    }

    // Загрузка файлов из рабочей папки пользователя
    const loadFilesFromWorkDir = async () => {
        let result;

        try {
            result = await axios.get(getByUserIdEndpoint + "userId=" + userId);
        } catch {
            alert("Не удалось загрузить список файлов");
            return;
        }
        setFiles(result.data);
        setCurrentDirectory("");

        console.log(result.data);
    }

    // Загрузка отдельного списка файлов для дерева навигации
    const loadTreeViewFiles = async () => {
        let result;
        try {
            result = await axios.get(getAllFilesListEndpoint + "userId=" + userId);
        } catch {
            alert("Не удалось загрузить файлы для дерева навигации");
            return;
        }
        setTreeViewFiles(result.data);
    }

    // Загрузка файлов из корзины для данного пользователя
    const loadFilesFromTrashbin = async () => {
        let result;
        try { 
            result = await axios.get(getFilesFromTrashbinEndpoint + "userId=" + userId);
        } catch {
            alert("Не удалось обновить корзину");
            return;
        }
        if (result.data != "")
            setFiles(result.data);
        else
            setFiles([]);
    }

    const createFolder = async (name) => { 
        try {
            await axios.post(createDirectoryEndpoint
                + "userId=" + userId
                + "&directoryName=" + name
                + "&path=" + currentDirectory);
        } catch {
            alert("Не удалось создать папку");
            return;
        }

        updatePage();
    }

    // Загрузка файлов из указанной папки
    const openFolder = async (name, path) => {
        let result;

        try {
            result = await axios.get(getFilesListEndpoint + "userId=" + userId + "&directory=" + path);
        } catch {
            alert("Не удалось открыть папку");
            return;
        }

        setFiles(result.data);
        if (name != null) {
            addBreadcrumb(name, path)
            setCurrentDirectory(path);
        }
    }

    const selectFilesFromFilesystem = () => {
        // Открытие диалога выбора файлов
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = 'multiple';

        // При завершении работы с диалогом выбора
        // обновить файлы в таблице
        input.onchange = e => {
            const filesToUpload = e.target.files;
            if (filesToUpload.length > 0)
                uploadFiles(e.target.files);
        }

        input.click();
    }

    const uploadFiles = async (filesToUpload) => {
        const uploadParams = "userId=" + userId
            + "&destination=" + currentDirectory;

        const url = uploadFilesEndpoint + uploadParams;

        // Имитация формы для выбора загружаемых файлов
        const formData = new FormData();
        
        for (let index = 0; index < filesToUpload.length; index++) {
            formData.append('files', filesToUpload[index]);
        }

        // Указываем, что загружаемый тип данных - файлы с формы
        const config = {
            headers: {
                'content-type': 'multipart/form-data'
            }
        }
        
        try {
            await axios.post(url, formData, config);
        } catch {
            alert("Не удалось загрузить файлы в хранилище");
            return;
        }

        alert("Файлы успешно загружены в хранилище!");
        updatePage();
    }

    // TODO: Implement proper singular and multiple file download
    const downloadSelectedFiles = async () => {
        if (selectedRow == null)
        {
            alert("Выберите файл, который хотите загрузить");
            return;
        }

        const rowIndex = getRowIndex(selectedRow);
        const file = files[rowIndex];
        const fileDownloadPath = getFullFilePath(file);

        try {
            const downloaded = await axios.get(fileDownloadEndpoint
                + "filePaths=" + fileDownloadPath
                + "&userId=" + userId,
                {
                    responseType: 'blob'
                })
                .then(downloaded => resolveDownload("new.zip", downloaded))
        } catch {
            alert("Не удалось скачать файлы");
            return;
        }

        alert("Файлы успешно скачаны!");
    }

    // Перемещение загруженного файла в файловую
    // систему компьютера
    const resolveDownload = (name, file) => {
        let filename = decodeURI(name);
        const url = window.URL.createObjectURL(new Blob([file.data]));
        const link = document.createElement('a');

        link.href = url;
        link.setAttribute('download', filename);

        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        link.remove();
    }

    const moveSelectedFiles = async (selectedPath) => {
        const rowIndex = getRowIndex(selectedRow);
        const file = files[rowIndex];

        try {
            await axios.put(moveFileEndpoint
                + "userId=" + userId
                + "&destination=" + selectedPath
                + "&fileIds=" + file.id);
        } catch {
            alert("Не удалось переместить файл");
            return;
        }

        alert("Файлы успешно перемещены");
        updatePage();
    }

    const deleteSelectedFiles = async () => {
        if (selectedRow == null)
        {
            alert("Выберите файл, который хотите загрузить");
            return;
        }

        const rowIndex = getRowIndex(selectedRow);
        const file = files[rowIndex];
        await axios.post(putToTrashbinEndpoint 
            + "fileName=" + file.name 
            + "&filePath=" + file.path
            + "&userId=" + userId);

        updatePage();
    }

    const destroySelectedFiles = async () => {
        if (selectedRow == null)
        {
            alert("Выберите файл, который хотите уничтожить");
            return;
        }

        if (!window.confirm("Вы действительно хотите удалить файлы безвозвратно?"))
            return;

        const rowIndex = getRowIndex(selectedRow);
        const file = files[rowIndex];
        try {
        await axios.delete(destroyFileEndpoint
            + "userId=" + userId
            + "&fileId=" + file.id);
        } catch {
            alert("Не удалось уничтожить файл");
            return;
        }
            
        alert("Файлы успешно уничтожены!");
        loadFilesFromTrashbin();
    }

    const restoreSelectedFiles = async () => {
        if (selectedRow == null)
        {
            alert("Выберите файл, который хотите восстановить");
            return;
        }

        const rowIndex = getRowIndex(selectedRow);
        const file = files[rowIndex];
        try {
            await axios.put(restoreFileEndpoint
                + "userId=" + userId
                + "&fileId=" + file.id);
        } catch {
            alert("Не удалось восстановить файл");
            return;
        }

        alert("Файлы успешно восстановлены!");
        loadFilesFromTrashbin();
    }

    // Приводит размер файла к Б. Кб. Мб, Гб.
    const formatSize = (size) => {
        let hops = 0;
        while (size > 1024) {
            size /= 1024;
            hops++;
        }

        size = Math.round(size);

        switch (hops) {
            case 0: return size + " Б";
            case 1: return size + " Кб";
            case 2: return size + " Mб";
            case 3: return size + " Гб";
            default: return "";
        }
    }

    // Изменение стиля выбранной строки
    const selectRow = (row) => {
        // При первом нажатии строка считается выбранной
        if (selectedRow != row)
        {
            if (selectedRow != null)
                selectedRow.classList.remove("table-primary");
            row.classList.add("table-primary")
            setSelectedRow(row);
        }
        // При повторном нажатии выбор со строки снимается
        else
        {
            row.classList.remove("table-primary");
            setSelectedRow(null);
        }
    }

    // Получение индекса выбранной строки.
    // По индексу можно получить файл, сопоставленный
    // с данной строкой
    const getRowIndex = (row) => {
        const index = row.childNodes.item("files-table-indexer").innerText - 1;
        return index;
    }   

    const getFullFilePath = (file) => {
        // Если путь к файлу пустой, значит он сохранен в рабочей папке.
        // Для доступа к нему нужно только его имя.
        //
        // Если же у файла есть путь, то его также нужно учитывать 
        // при запросе.
        return file.path == "" ?
            file.name
            : file.path + "/" + file.name;
    }

    // ***********************
    // * Обработчики событий *
    // ***********************

    const onRowClick = (e) => {
        const tr = e.target.closest("tr");
        selectRow(tr);
    }

    const onRowDoubleClick = (e) => {
        const tr = e.target.closest("tr");
        const rowIndex = getRowIndex(tr);
        const fileType = files[rowIndex].type;
        
        if (fileType == "DIRECTORY")
        {
            const file = files[rowIndex];
            const folder = getFullFilePath(file);
            openFolder(file.name, folder);
        }
    }

    const onBreadcrumbLinkClick = (e) => {
        const linkComponent = e.target;
        const id = linkComponent.getAttribute("id");
        const path = linkComponent.getAttribute("path");

        // Если переходим в рабочую папку...
        if (path == "/")
            // ...загружаем файлы из рабочей папки
            loadFilesFromWorkDir();
        else
            // Загружаем файлы для папки, в которую переходим
            openFolder(null, path);

        removeBreadcrumbs(breadcrumbs.length - id);
    }

    const onCheckboxChange = (e) => {
        const tr = e.target.closest("tr");
        selectRow(tr);
    }

    const onUploadButtonClick = (e) => {
        selectFilesFromFilesystem();
    }

    const onDownloadButtonClick = (e) => {
        downloadSelectedFiles();
    }

    const onMoveFileButtonClick = (e) => {
        if (selectedRow == null)
        {
            alert("Выберите файл, который хотите переместить");
            return;
        }
        setMoveToDirDialogOpen(true);
    }

    const onDeleteFileButtonClick = (e) => {
        deleteSelectedFiles();
    }

    const onTrashbinButtonClick = (e) => {
        setIsInTrashbin(!isInTrashbin);
        if (!isInTrashbin)
            loadFilesFromTrashbin();
        else
            updateTable();
    }

    const onRestoreButtonClick = (e) => {
        restoreSelectedFiles();
    }

    const onDestroyButtonClick = (e) => {
        destroySelectedFiles();
    }

    const onContextMenu = (e) => {
        e.preventDefault();
        // Отображать все опции контекстного меню
        setContextMenuDirOnly(false);
        setContextMenu(
            contextMenu === null ?
                {
                    mouseX: e.clientX + 2,
                    mouseY: e.clientY - 6,
                }
                : null,
        );

        
        const tr = e.target.closest("tr");
        selectRow(tr);
    }

    const onCloseContextMenu = () => {
        setContextMenu(null);
        // Отображать все опции контекстного меню
        setContextMenuDirOnly(false);
        if (selectedRow != null)
            selectRow(selectedRow);
    }

    return (
        <Stack 
            direction={"row"}
            style={{
                height: "94%", 
                width: "100%",
                marginTop: "27px",
                marginBottom: "27px"}}>
            <nav style={{
                    minWidth: "240px", 
                    width: "25%", 
                    maxWidth: "490px", 
                    borderRight: "solid 2px #dedede", 
                    overflow: "scroll"}}>
                <h1 style={{textAlign: "center", padding: "30px 20px"}}>Хранилище</h1>

                <Stack style={{height: "100%"}}>
                    <TreeView
                        defaultCollapseIcon={<ExpandMoreIcon />}
                        defaultExpandIcon={<ChevronRightIcon />}
                        style={{ padding: "20px", overflow: "scroll", height: "80%" }}>
                        {renderTreeItems(getNodesFromFiles(treeViewFiles))}
                    </TreeView>

                    <Box alignSelf={"center"}>
                        {
                            !isInTrashbin
                            ? <TrashbinButton onClick={onTrashbinButtonClick}/>
                            : <StorageButton onClick={onTrashbinButtonClick}/>
                        }
                    </Box>
                </Stack>

            </nav>
            <div style={{margin: "0 37px", width: "100%"}}>
                <h1 style={{
                    display: isInTrashbin ? "block" : "none",
                    marginBottom: "30px",
                    marginTop: "50px",
                    fontSize: "x-large",
                    padding: "0.2em 0.3em"
                }}>Корзина</h1>

                <Breadcrumbs 
                    separator={<ArrowRight/>}
                    style={{
                        marginBottom: "30px", 
                        marginTop: "50px",
                        display: isInTrashbin ? "none" : "block" }}>
                    <Link id="0" path="/" className="breadcrumb-link" onClick={onBreadcrumbLinkClick}>Мое хранилище</Link>
                    {breadcrumbs}
                </Breadcrumbs>

                {
                    isInTrashbin 
                        ? <TrashbinToolbar
                                onRestoreClick={onRestoreButtonClick}
                                onDestroyClick={onDestroyButtonClick}
                                style={{marginBottom: "20px"}}/>
                        : <StorageToolbar
                                onUploadClick={onUploadButtonClick}
                                onDownloadClick={onDownloadButtonClick}
                                onMoveFileClick={onMoveFileButtonClick}
                                onDeleteFileClick={onDeleteFileButtonClick}
                                style={{marginBottom: "20px"}}/> 
                }

                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th scope="col"></th>
                            <th scope="col">Имя</th>
                            <th scope="col">Тип</th>
                            <th scope="col">Размер</th>
                            <th scope="col">Дата создания</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            files.map((file, index) => (
                                <tr onClick={onRowClick} 
                                    onDoubleClick={onRowDoubleClick}
                                    onContextMenu={onContextMenu}
                                    style={{ cursor: "context menu" }}>
                                    <td id="files-table-indexer" style={{ display: 'none' }} key={index}>{index + 1}</td>
                                    <td><input type="checkbox" onChange={onCheckboxChange} /></td>
                                    <td>{file.name}</td>
                                    <td>{file.typeTitle}</td>
                                    <td>{file.type == "DIRECTORY" ? "" : formatSize(file.size)}</td>
                                    <td>{format(new Date(file.dateCreated), "dd.MM.yyyy")}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
            <MoveToDirDialog 
                open={moveToDirDialogOpen} 
                treeItems={renderTreeItems(getNodesFromFiles(treeViewFiles), true)}
                mappedItems={treeViewFiles}
                onOk={(selectedPath) => {
                    moveSelectedFiles(selectedPath);
                    setMoveToDirDialogOpen(false);
                }}
                onClose={() => {setMoveToDirDialogOpen(false)}}/>
            <CreateDirDialog
                open={createDirDialogOpen}
                onOk={(folderName) => {
                    setCreateDirDialogOpen(false);
                    createFolder(folderName);
                }}
                onClose={() => {
                    setCreateDirDialogOpen(false);
                }}/>
            <ContextMenu 
                contextMenu={contextMenu}
                createDirOnly={contextMenuDirOnly}
                onClose={onCloseContextMenu}
                onCreateFolderClick={() => setCreateDirDialogOpen(true)}
                onDownloadClick={onDownloadButtonClick}
                onMoveClick={onMoveFileButtonClick}
                onDeleteClick={onDeleteFileButtonClick}/>
        </Stack>
    );
}

export default Home;