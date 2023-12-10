import React, { useEffect, useState } from "react";
import axios from "axios";
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css'
import { Breadcrumbs } from "@mui/material";
import Link from "@mui/material/Link";
import { TreeView } from "@mui/x-tree-view/TreeView";
import { TreeItem } from "@mui/x-tree-view";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

function Home() {
    const [files, setFiles] = useState([]);
    const [treeViewFiles, setTreeViewFiles] = useState([]);
    const [breadcrumbs, setBreadcrumbs] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);
    const [currentDirectory, setCurrentDirectory] = useState("");

    const userId = 1;
    const workingDir = "Trisha";

    const uploadFilesEndpoint = "http://localhost:8080/files/uploadMultiple?"
    const getFilesListEndpoint = "http://localhost:8080/files/get?"
    const getByUserIdEndpoint = "http://localhost:8080/files/getByUserId?"
    const fileDownloadEndpoint = "http://localhost:8080/files/downloadMultiple?";
    const putToTrashbinEndpoint = "http://localhost:8080/trashbin/put?";
    const moveFileEndpoint = "http://";
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

    const generateTreeItems = () => {
        const treeItemsMapping = [];
        let newTreeItemIndex = 0;

        // Ведем список директорий
        const filesMapping = [];

        treeViewFiles.map((file, index) => {
            if (file.type == "DIRECTORY") {
                treeItemsMapping.push(
                    {   mappedItem:
                            <TreeItem key={index} nodeId={index} label={file.name}>
                                <TreeItem display="none"/>
                            </TreeItem>,
                        children: []
                    }
                )
            }
            else {
                treeItemsMapping.push(
                    {   mappedItem:
                            <TreeItem key={index} nodeId={index} label={file.name}/>,
                        children: []
                    }
                )
            }
            // Если файл лежит в папке
            if (file.path != "") {
                let treeItemIndex;
                let parentTreeItem;
                let mappedFile;
                let mappedFileFullPath = "";

                // Ищем ее родительскую папку в списке
                for (let index = 0; index < filesMapping.length; index++) {
                    // Например, file.name = Pictures
                    //           file.path = Documents/MyDocs
                    //           filesMapping[index].name = MyDocs
                    //           filesMapping[index].path = Documents
                    mappedFile = filesMapping[index].mappedFile;
                    mappedFileFullPath = getFullFilePath(mappedFile); // Например: Documents/MyDocs

                    // Если родительская папка найдена
                    if (mappedFileFullPath == file.path) {
                        // Добавляем к ней индекс данного TreeItem
                        treeItemIndex = filesMapping[index].mappedNodeIdx;
                        parentTreeItem = treeItemsMapping[treeItemIndex];
                        parentTreeItem.children.push(newTreeItemIndex);
                    }
                }
            }

            filesMapping.push({ mappedFile: file, mappedNodeIdx: newTreeItemIndex });
            newTreeItemIndex++;
        });

        return assembleTreeItems(treeItemsMapping);
    }

    const assembleTreeItems = (treeItemsMapping) => {
        const assembledTreeItems = [];
        let itemToAppend;
        let appendIndex;
        for (let index = 0; index < treeItemsMapping.length; index++) {
            const treeItem = treeItemsMapping[index];
            
            if (treeItem.children.length > 0) {
                for (let j = 0; j < treeItem.children.length; j++) {
                    appendIndex = treeItem.children[j];
                    itemToAppend = treeItemsMapping[appendIndex].mappedItem;
                    treeItem.mappedItem.children = <h1>IM A FIRIng man LazeR</h1>
                }
            }

            assembledTreeItems.push(treeItem.mappedItem);
        }

        return assembledTreeItems;
    }

    const loadFiles = async () => {
        const result = await axios.get(getByUserIdEndpoint + "userId=" + userId);
        setFiles(result.data);
        setCurrentDirectory("");
    }

    const loadTreeViewFiles = async () => {
        const result = await axios.get(getByUserIdEndpoint + "userId=" + userId);
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

    const moveSelectedFiles = () => {
        alert("NOT IMPLEMENTED YET!!!");
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
        moveSelectedFiles();
    }

    const onDeleteFileButtonClick = (e) => {
        deleteSelectedFiles();
    }

    const onTrashbinButtonClick = (e) => {
        deleteSelectedFiles();
    }

    const onTreeItemExpand = (e, index) => {
        
        const file = treeViewFiles[index];
        if (file.type != "DIRECTORY")
            return;

        
        const path = getFullFilePath(file);

        const newTreeViewFiles = [...treeViewFiles];

        loadFilesFromFolder(path, (filesToAppend) => {
            filesToAppend.forEach(f => {
                newTreeViewFiles.push(f);
            });

            setTreeViewFiles(newTreeViewFiles);
        });
    }

    return (
        <div style={{display: 'flex', flexDirection: 'row'}}>
            <nav>
                <h1>Хранилище</h1>

                <TreeView
                    aria-label="file system navigator"
                    defaultCollapseIcon={<ExpandMoreIcon />}
                    defaultExpandIcon={<ChevronRightIcon />}
                    onNodeSelect={onTreeItemExpand}
                >
                    {generateTreeItems()}
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
        </div>
    );
}

export default Home;