# Scheduled Playlist Exporter for MediaMonkey

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
2. Find "Scheduled Playlist Exporter" in the list
3. Click the **Options** button or run "Configure Playlist Export" action
4. Configure the following settings:
   - **Export Path**: Select the folder where M3U files will be saved
   - **Path Format**: Choose forward slashes (/) for Linux-style or backslashes (\) for Windows-style
   - **Playlist Selection**: 
     - Check "Export All Playlists" to export all playlists
     - Uncheck to select specific playlists from the list (hold Ctrl/Cmd to select multiple)
5. Click **Save Configuration**

### Exporting Playlists

**Method 1: From Options Page**
- Click the **Export Now** button on the options page

**Method 2: From MediaMonkey Menu**
- Go to **Tools > Extensions** (or wherever addons are accessed)
- Run the **Export Playlists** action

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
