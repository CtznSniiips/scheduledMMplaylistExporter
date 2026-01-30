/**
 * Scheduled Playlist Exporter - Main Script
 * A MediaMonkey addon for exporting selected playlists to M3U files
 */

// Initialize the addon
function initializeAddon() {
  // Register action handlers
  app.actions.exportPlaylists = {
    execute: function() {
      exportSelectedPlaylists();
    }
  };
  
  app.actions.configureExport = {
    execute: function() {
      showConfigDialog();
    }
  };
}

// Get addon configuration
function getConfig() {
  var config = {
    selectedPlaylists: app.getValue('exportSelectedPlaylists', ''),
    exportAll: app.getValue('exportAllPlaylists', true),
    exportPath: app.getValue('exportPath', ''),
    useForwardSlash: app.getValue('useForwardSlash', true)
  };
  return config;
}

// Save addon configuration
function saveConfig(config) {
  app.setValue('exportSelectedPlaylists', config.selectedPlaylists);
  app.setValue('exportAllPlaylists', config.exportAll);
  app.setValue('exportPath', config.exportPath);
  app.setValue('useForwardSlash', config.useForwardSlash);
}

// Get all playlists from the database
function getAllPlaylists() {
  var playlists = [];
  var sql = "SELECT IDPlaylist, PlaylistName FROM Playlists WHERE PlaylistName IS NOT NULL AND PlaylistName != '' ORDER BY PlaylistName";
  
  var dbConnection = app.getDb();
  var stmt = dbConnection.prepare(sql);
  
  while (stmt.step()) {
    playlists.push({
      id: stmt.getValue(0),
      name: stmt.getValue(1)
    });
  }
  
  stmt.finalize();
  return playlists;
}

// Get tracks for a specific playlist
function getPlaylistTracks(playlistId) {
  var tracks = [];
  var sql = "SELECT Songs.SongPath FROM PlaylistSongs " +
            "INNER JOIN Songs ON PlaylistSongs.IDSong = Songs.ID " +
            "WHERE PlaylistSongs.IDPlaylist = ? " +
            "ORDER BY PlaylistSongs.SongOrder";
  
  var dbConnection = app.getDb();
  var stmt = dbConnection.prepare(sql);
  stmt.bind(1, playlistId);
  
  while (stmt.step()) {
    tracks.push(stmt.getValue(0));
  }
  
  stmt.finalize();
  return tracks;
}

// Convert path to use specified slash format
function convertPathSlashes(path, useForwardSlash) {
  if (useForwardSlash) {
    return path.replace(/\\/g, '/');
  } else {
    return path.replace(/\//g, '\\');
  }
}

// Export a single playlist to M3U file
function exportPlaylist(playlist, exportPath, useForwardSlash) {
  try {
    var tracks = getPlaylistTracks(playlist.id);
    
    if (tracks.length === 0) {
      return { success: false, error: 'Playlist "' + playlist.name + '" has no tracks' };
    }
    
    // Create M3U content
    var m3uContent = '#EXTM3U\n';
    
    for (var i = 0; i < tracks.length; i++) {
      var trackPath = convertPathSlashes(tracks[i], useForwardSlash);
      m3uContent += trackPath + '\n';
    }
    
    // Sanitize playlist name for filename
    var safeFilename = playlist.name.replace(/[<>:"/\\|?*]/g, '_');
    var filePath = exportPath + '\\' + safeFilename + '.m3u';
    
    // Write to file
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    var file = fso.CreateTextFile(filePath, true);
    file.Write(m3uContent);
    file.Close();
    
    return { success: true, path: filePath };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// Export selected playlists
function exportSelectedPlaylists() {
  var config = getConfig();
  
  // Validate export path
  if (!config.exportPath || config.exportPath === '') {
    app.alert('Please configure the export path first using "Configure Playlist Export"');
    return;
  }
  
  // Check if export path exists
  var fso = new ActiveXObject("Scripting.FileSystemObject");
  if (!fso.FolderExists(config.exportPath)) {
    app.alert('Export path does not exist: ' + config.exportPath);
    return;
  }
  
  // Get all playlists
  var allPlaylists = getAllPlaylists();
  
  if (allPlaylists.length === 0) {
    app.alert('No playlists found in the database');
    return;
  }
  
  // Determine which playlists to export
  var playlistsToExport = [];
  
  if (config.exportAll) {
    playlistsToExport = allPlaylists;
  } else {
    // Parse selected playlist IDs
    var selectedIds = config.selectedPlaylists.split(',');
    for (var i = 0; i < allPlaylists.length; i++) {
      for (var j = 0; j < selectedIds.length; j++) {
        if (allPlaylists[i].id.toString() === selectedIds[j].trim()) {
          playlistsToExport.push(allPlaylists[i]);
          break;
        }
      }
    }
  }
  
  if (playlistsToExport.length === 0) {
    app.alert('No playlists selected for export');
    return;
  }
  
  // Export playlists
  var successCount = 0;
  var errors = [];
  
  for (var i = 0; i < playlistsToExport.length; i++) {
    var result = exportPlaylist(playlistsToExport[i], config.exportPath, config.useForwardSlash);
    if (result.success) {
      successCount++;
    } else {
      errors.push(result.error);
    }
  }
  
  // Show results
  var message = 'Export complete!\n\n';
  message += 'Successfully exported: ' + successCount + ' playlist(s)\n';
  
  if (errors.length > 0) {
    message += '\nErrors:\n' + errors.join('\n');
  }
  
  app.alert(message);
}

// Show configuration dialog
function showConfigDialog() {
  var config = getConfig();
  var allPlaylists = getAllPlaylists();
  
  // Create dialog HTML
  var html = '<html><head><title>Configure Playlist Export</title></head><body>';
  html += '<h2>Playlist Export Configuration</h2>';
  
  // Export path selection
  html += '<div><label>Export Path:</label><br/>';
  html += '<input type="text" id="exportPath" value="' + config.exportPath + '" style="width:300px;"/>';
  html += '<button onclick="selectFolder()">Browse...</button></div><br/>';
  
  // Path format selection
  html += '<div><label>Path Format:</label><br/>';
  html += '<input type="radio" id="forwardSlash" name="pathFormat" value="forward"' + (config.useForwardSlash ? ' checked' : '') + '/>';
  html += '<label for="forwardSlash">Forward slashes (/) - Linux-style</label><br/>';
  html += '<input type="radio" id="backSlash" name="pathFormat" value="back"' + (!config.useForwardSlash ? ' checked' : '') + '/>';
  html += '<label for="backSlash">Back slashes (\\) - Windows-style</label></div><br/>';
  
  // Playlist selection
  html += '<div><input type="checkbox" id="exportAll"' + (config.exportAll ? ' checked' : '') + ' onclick="togglePlaylistSelection()"/>';
  html += '<label for="exportAll">Export All Playlists</label></div><br/>';
  
  html += '<div id="playlistSelection"' + (config.exportAll ? ' style="display:none;"' : '') + '>';
  html += '<label>Select Playlists to Export:</label><br/>';
  html += '<select id="playlists" multiple size="10" style="width:300px;">';
  
  var selectedIds = config.selectedPlaylists.split(',');
  for (var i = 0; i < allPlaylists.length; i++) {
    var selected = false;
    for (var j = 0; j < selectedIds.length; j++) {
      if (allPlaylists[i].id.toString() === selectedIds[j].trim()) {
        selected = true;
        break;
      }
    }
    html += '<option value="' + allPlaylists[i].id + '"' + (selected ? ' selected' : '') + '>';
    html += allPlaylists[i].name + '</option>';
  }
  
  html += '</select></div><br/>';
  
  // Buttons
  html += '<button onclick="saveSettings()">Save</button> ';
  html += '<button onclick="window.close()">Cancel</button>';
  
  html += '</body></html>';
  
  // Show dialog (this is a simplified version - actual implementation would use MediaMonkey's dialog system)
  app.alert('Configuration dialog would be shown here. Please use the options page instead.');
}

// Initialize the addon when MediaMonkey loads it
initializeAddon();
