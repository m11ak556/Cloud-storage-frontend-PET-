import React, { useEffect, useState } from "react";
import axios from "axios";
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css'
import { Breadcrumbs } from "@mui/material";
import Link from "@mui/material/Link";
import { TreeView } from "@mui/x-tree-view/TreeView";
import { TreeItem } from "@mui/x-tree-view";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MoveToDirDialog from "./components/MoveToDirDialog";
import SelectFolderDialog from "./components/SelectFolderDialog";

function Home(props) {
    const {userId} = props;

    const [files, setFiles] = useState([]);
    const [treeViewFiles, setTreeViewFiles] = useState([]);
    const [breadcrumbs, setBreadcrumbs] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);
    const [currentDirectory, setCurrentDirectory] = useState("");
    const [moveToDirDialogOpen, setMoveToDirDialogOpen] = useState(false);
    const [selectFolderDialogOpen, setSelectFolderDialogOpen] = useState(false);

    const uploadFilesEndpoint = "http://localhost:8080/files/uploadMultiple?"
    const getFilesListEndpoint = "http://localhost:8080/files/get?"
    const getAllFilesListEndpoint = "http://localhost:8080/files/getAll?"
    const getByUserIdEndpoint = "http://localhost:8080/files/getByUserId?"
    const fileDownloadEndpoint = "http://localhost:8080/files/downloadMultiple?";
    const putToTrashbinEndpoint = "http://localhost:8080/trashbin/put?";
    const moveFileEndpoint = "http://localhost:8080/files/move?";
    const goToTrashbin = "http://"

    useEffect(() => {
        loadFiles();
        loadTreeViewFiles();
    }, []);

    const addBreadcrumb = (name, link) => {
        const newId = breadcrumbs.length + 1;
        breadcrumbs.push(
            <Link id={newId} path={link} underline="hover" onClick={onBreadcrumbLinkClick}>{name}</Link>
        )
    }

    const removeBreadcrumbs = (count) => {
        for (let index = 0; index < count; index++) {
            breadcrumbs.pop(index);
        }
    }

    const updateTable = () => {
        if (currentDirectory == "")
            loadFiles();
        else
            openFolder(null, currentDirectory);
    }

    const renderTreeItems = (nodes, onlyDirectories = false) => {
        if (Array.isArray(nodes)) {
            return nodes.map((node) =>
                <TreeItem key={node.id} nodeId={node.id} label={node.name}
                    disabled={onlyDirectories && !node.isDirectory}>
                    {
                        Array.isArray(node.children)
                            ? node.children.map((n) => renderTreeItems(n, onlyDirectories))
                            : null
                    }
                </TreeItem>
            );
        }
        else {
            return <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.name}
                        disabled={onlyDirectories && !nodes.isDirectory}>
                        {
                            Array.isArray(nodes.children)
                                ? nodes.children.map((n) => renderTreeItems(n, onlyDirectories))
                                : null
                        }
                    </TreeItem>
        }
    }

    const getNodesFromFiles = (filesList) => {
        const treeOfFiles = [];
        const directoriesMapping = [];

        filesList.sort((f1, f2) => f1.path > f2.path);

        // Нужно как-то учитывать уровень в иерархии

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
                    //...добавляем в список папок
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
                            //...добавляем в список папок
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

    const loadFiles = async () => {
        const result = await axios.get(getByUserIdEndpoint + "userId=" + userId);
        setFiles(result.data);
        setCurrentDirectory("");
    }

    const loadTreeViewFiles = async () => {
        const result = await axios.get(getAllFilesListEndpoint + "userId=" + userId);
        setTreeViewFiles(result.data);
    }

    const loadFilesFromFolder = async (path, callback) => {
        const result = await axios.get(getFilesListEndpoint + "userId=" + userId + "&directory=" + path);
        callback(result.data);
    }

    const openFolder = async (name, path) => {
        const result = await axios.get(getFilesListEndpoint + "userId=" + userId + "&directory=" + path);
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
        const formData = new FormData();
        
        for (let index = 0; index < filesToUpload.length; index++) {
            formData.append('files', filesToUpload[index]);
        }

        const config = {
            headers: {
                'content-type': 'multipart/form-data'
            }
        }
        
        await axios.post(url, formData, config)
            .then(() => { updateTable(); })
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
        const downloaded = await axios.get(fileDownloadEndpoint 
            + "filePaths=" + fileDownloadPath
            + "&userId=" + userId, 
            {
                responseType: 'blob'
            })
            .then(downloaded => resolveDownload("new.zip", downloaded))
    }

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

        await axios.put(moveFileEndpoint 
            + "userId=" + userId
            + "&destination=" + selectedPath
            + "&fileIds=" + file.id);

        alert("Файлы успешно перемещены");
        updateTable();
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
        loadFiles();
    }

    const selectRow = (row) => {
        if (selectedRow != row)
        {
            if (selectedRow != null)
                selectedRow.classList.remove("table-primary");
            row.classList.add("table-primary")
            setSelectedRow(row);
        }
        else
        {
            row.classList.remove("table-primary");
            setSelectedRow(null);
        }
    }

    const onRowClick = (e) => {
        const tr = e.target.closest("tr");
        selectRow(tr);
    }

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

    // ******************
    // * Event handlers *
    // ******************
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

        if (path == "/")
            loadFiles();
        else
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
        deleteSelectedFiles();
    }

    return (
        <div style={{display: 'flex', flexDirection: 'row'}}>
            <nav>
                <h1>Хранилище</h1>

                <TreeView
                    aria-label="file system navigator"
                    defaultCollapseIcon={<ExpandMoreIcon />}
                    defaultExpandIcon={<ChevronRightIcon />}
                >
                    {renderTreeItems(getNodesFromFiles(treeViewFiles))}
                </TreeView>

                <button className="btn" onClick={onTrashbinButtonClick}>Корзина</button>
            </nav>
            <div>
                <h1>Мое хранилище</h1>

                <button className="btn btn-primary" onClick={onUploadButtonClick}>Загрузить файл</button>
                <button className="btn btn-primary" onClick={onDownloadButtonClick}>Скачать файл</button>
                <button className="btn btn-primary" onClick={onMoveFileButtonClick}>Переместить</button>
                <button className="btn btn-danger" onClick={onDeleteFileButtonClick}>Удалить</button>


                <Breadcrumbs separator="›" aria-label="breadcrumb">
                    <Link id="0" path="/" underline="hover" onClick={onBreadcrumbLinkClick}>Мое хранилище</Link>
                    {breadcrumbs}
                </Breadcrumbs>
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th scope="col"></th>
                            <th scope="col">Наименование</th>
                            <th scope="col">Дата создания</th>
                            <th scope="col">Тип</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            files.map((file, index) => (
                                <tr onClick={onRowClick} onDoubleClick={onRowDoubleClick}>
                                    <td id="files-table-indexer" style={{ display: 'none' }} key={index}>{index + 1}</td>
                                    <td><input type="checkbox" onChange={onCheckboxChange} /></td>
                                    <td>{file.name}</td>
                                    <td>{file.dateCreated}</td>
                                    <td>{file.type}</td>
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
        </div>
    );
}

export default Home;