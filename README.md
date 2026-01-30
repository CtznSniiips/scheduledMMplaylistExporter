# Playlist Exporter for MediaMonkey

A MediaMonkey addon that allows you to export selected playlists (or all playlists) to M3U files with configurable path formats.

## Features

- **Export All or Selected Playlists**: Choose to export all playlists in your MediaMonkey database or select specific ones
- **Configurable Export Location**: Select any folder on your system to export the M3U files
- **Path Format Options**: Choose between forward slashes (Linux-style) or backslashes (Windows-style) for file paths in the M3U files
- **User-Friendly Configuration**: Easy-to-use options page for configuring all settings
- **Manual Export**: Export playlists on demand using the "Export Playlists" action

## Installation

1. Download or clone this repository
2. Copy the addon folder to your MediaMonkey addons directory:
   - MediaMonkey 5: `%AppData%\MediaMonkey\Addons\`
   - Or use MediaMonkey's built-in addon installer
3. Restart MediaMonkey
4. The addon should now appear in MediaMonkey's addon list

## Usage

### Configuration

1. In MediaMonkey, go to **Tools > Options > Addons**
2. Find "Playlist Exporter" in the list
3. Configure the following settings:
   - **Export Folder**: Select the folder where M3U files will be saved
   - **Export All Playlists**: Check to export all playlists, uncheck to export only selected ones
   - **Use Forward Slashes (Unix-style)**: Check for forward slashes (/) or uncheck for backslashes (\)
   - **Selected Playlists**: Enter comma-separated playlist IDs when "Export All Playlists" is unchecked
4. Click **OK** to save the configuration

### Exporting Playlists

To export playlists:
- Use the **Export Playlists** action from the Tools menu or assigned keyboard shortcut
- Or access it through the playlist context menu if configured

### Output

- Each playlist is exported as a separate `.m3u` file
- Filenames are based on the playlist name (with invalid characters replaced by underscores)
- M3U files contain the `#EXTM3U` header followed by track paths
- File paths in the M3U files use your configured slash format

## File Format

The exported M3U files follow this format:

```
#EXTM3U
C:/Music/Artist/Album/Track1.mp3
C:/Music/Artist/Album/Track2.mp3
```

Or with Windows-style paths:

```
#EXTM3U
C:\Music\Artist\Album\Track1.mp3
C:\Music\Artist\Album\Track2.mp3
```

## Requirements

- MediaMonkey 5.0 or later
- Windows operating system (uses Windows Script Host features)

## Files

- `info.json` - Addon manifest file
- `main.js` - Main addon script with export functionality
- `options.html` - Configuration UI page

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, feature requests, or contributions, please visit the GitHub repository.

## Future Enhancements

Possible features for future versions:
- Scheduled/automated export functionality
- Export to additional playlist formats (PLS, XSPF, etc.)
- Batch operations and export templates
