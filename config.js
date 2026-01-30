/**
 * Configuration script for Playlist Exporter addon
 * Handles loading and saving addon settings
 */

window.configInfo = {
    // Configuration object to store settings
    config: null,
    UI: null,
    
    /**
     * Load configuration settings and populate the UI
     * @param {HTMLElement} pnlDiv - The panel HTML node
     * @param {Object} addon - Addon information object
     */
    load: function (pnlDiv, addon) {
        // Load config with defaults
        this.config = {
            exportPath: app.getValue('exportPath', ''),
            exportAllPlaylists: app.getValue('exportAllPlaylists', true),
            useForwardSlash: app.getValue('useForwardSlash', true),
            exportSelectedPlaylists: app.getValue('exportSelectedPlaylists', '')
        };
        
        // Get all UI elements by querying with data-id attributes
        this.UI = {
            chbExportAll: pnlDiv.querySelector('[data-id="chbExportAll"]'),
            chbUseForwardSlash: pnlDiv.querySelector('[data-id="chbUseForwardSlash"]'),
            txtExportPath: pnlDiv.querySelector('[data-id="txtExportPath"]')
        };
        
        // Set checkbox states (direct access to checkbox elements)
        if (this.UI.chbExportAll) {
            this.UI.chbExportAll.checked = this.config.exportAllPlaylists;
        }
        
        if (this.UI.chbUseForwardSlash) {
            this.UI.chbUseForwardSlash.checked = this.config.useForwardSlash;
        }
        
        // Set export path (direct access to input element)
        if (this.UI.txtExportPath) {
            this.UI.txtExportPath.value = this.config.exportPath;
        }
        
        // Setup browse button
        var btnBrowse = pnlDiv.querySelector('#btnBrowse');
        if (btnBrowse) {
            btnBrowse.onclick = function() {
                try {
                    var shell = new ActiveXObject("Shell.Application");
                    var folder = shell.BrowseForFolder(0, "Select folder for exported playlists:", 0);
                    
                    if (folder) {
                        var folderPath = folder.Self.Path;
                        if (window.configInfo.UI.txtExportPath) {
                            window.configInfo.UI.txtExportPath.value = folderPath;
                        }
                    }
                } catch (e) {
                    alert('Error selecting folder: ' + e.message);
                }
            };
        }
        
        // Load playlists into the select element
        this.loadPlaylists(pnlDiv);
        
        // Setup export all checkbox change handler
        var self = this;
        if (this.UI.chbExportAll) {
            this.UI.chbExportAll.addEventListener('change', function() {
                self.togglePlaylistSelection(pnlDiv);
            });
        }
        
        // Initial toggle of playlist selection
        this.togglePlaylistSelection(pnlDiv);
    },
    
    /**
     * Save configuration settings from the UI
     * @param {HTMLElement} pnlDiv - The panel HTML node
     * @param {Object} addon - Addon information object
     */
    save: function (pnlDiv, addon) {
        // Get current UI state (direct access to HTML elements)
        if (this.UI.txtExportPath) {
            this.config.exportPath = this.UI.txtExportPath.value;
        }
        
        if (this.UI.chbExportAll) {
            this.config.exportAllPlaylists = this.UI.chbExportAll.checked;
        }
        
        if (this.UI.chbUseForwardSlash) {
            this.config.useForwardSlash = this.UI.chbUseForwardSlash.checked;
        }
        
        // Get selected playlists
        var playlistSelect = pnlDiv.querySelector('#playlists');
        var selectedPlaylists = '';
        
        if (!this.config.exportAllPlaylists && playlistSelect) {
            var selectedOptions = [];
            for (var i = 0; i < playlistSelect.options.length; i++) {
                if (playlistSelect.options[i].selected) {
                    selectedOptions.push(playlistSelect.options[i].value);
                }
            }
            selectedPlaylists = selectedOptions.join(',');
        }
        this.config.exportSelectedPlaylists = selectedPlaylists;
        
        // Validate export path
        if (!this.config.exportPath) {
            alert('Please select an export path');
            return false;
        }
        
        // Check if path exists
        try {
            var fso = new ActiveXObject("Scripting.FileSystemObject");
            if (!fso.FolderExists(this.config.exportPath)) {
                if (!confirm('The selected path does not exist. Do you want to continue anyway?')) {
                    return false;
                }
            }
        } catch (e) {
            // If we can't check the path, show a warning but allow continuation
            alert('Warning: Could not verify export path. Error: ' + e.message);
        }
        
        // Validate playlist selection
        if (!this.config.exportAllPlaylists && !selectedPlaylists) {
            alert('Please select at least one playlist or check "Export All Playlists"');
            return false;
        }
        
        // Save all settings
        app.setValue('exportPath', this.config.exportPath);
        app.setValue('exportAllPlaylists', this.config.exportAllPlaylists);
        app.setValue('useForwardSlash', this.config.useForwardSlash);
        app.setValue('exportSelectedPlaylists', this.config.exportSelectedPlaylists);
        
        return true;
    },
    
    /**
     * Load playlists from database into the select element
     * @param {HTMLElement} pnlDiv - The panel HTML node
     */
    loadPlaylists: function(pnlDiv) {
        try {
            var playlistSelect = pnlDiv.querySelector('#playlists');
            if (!playlistSelect) return;
            
            playlistSelect.innerHTML = '';
            
            // Get all playlists from database
            var sql = "SELECT IDPlaylist, PlaylistName FROM Playlists WHERE PlaylistName IS NOT NULL AND PlaylistName != '' ORDER BY PlaylistName";
            var dbConnection = app.getDb();
            var stmt = dbConnection.prepare(sql);
            
            var selectedArray = this.config.exportSelectedPlaylists ? this.config.exportSelectedPlaylists.split(',') : [];
            
            while (stmt.step()) {
                var id = stmt.getValue(0);
                var name = stmt.getValue(1);
                
                var option = document.createElement('option');
                option.value = id;
                option.textContent = name;
                
                // Check if this playlist should be selected
                for (var i = 0; i < selectedArray.length; i++) {
                    if (id.toString() === selectedArray[i].trim()) {
                        option.selected = true;
                        break;
                    }
                }
                
                playlistSelect.appendChild(option);
            }
            
            stmt.finalize();
        } catch (e) {
            if (typeof console !== 'undefined' && console.error) {
                console.error('Error loading playlists:', e);
            }
        }
    },
    
    /**
     * Toggle playlist selection visibility based on "Export All" checkbox
     * @param {HTMLElement} pnlDiv - The panel HTML node
     */
    togglePlaylistSelection: function(pnlDiv) {
        var playlistDiv = pnlDiv.querySelector('#playlistSelectionDiv');
        if (!playlistDiv) return;
        
        // Check if UI element exists (direct access to checkbox element)
        if (!this.UI.chbExportAll) {
            // If UI element not available, default to hiding the playlist selection
            playlistDiv.style.display = 'none';
            return;
        }
        
        var exportAll = this.UI.chbExportAll.checked;
        
        if (exportAll) {
            playlistDiv.style.display = 'none';
        } else {
            playlistDiv.style.display = 'block';
        }
    }
};
