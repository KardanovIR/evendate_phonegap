module.exports = function(grunt) {

	grunt.initConfig({
		phonegap: {
			config: {
				root: 'www',
				config: 'www/config.xml',
				cordova: '.cordova',
				html : 'index.html', // (Optional) You may change this to any other.html
				path: 'phonegap',
				plugins: ['/local/path/to/plugin', 'http://example.com/path/to/plugin.git'],
				platforms: ['ios'],
				maxBuffer: 500, // You may need to raise this for iOS.
				verbose: false,
				releases: 'releases',
				releaseName: function(){
					var pkg = grunt.file.readJSON('package.json');
					return(pkg.name + '-' + pkg.version);
				},
				debuggable: false,

				// Must be set for ios to work.
				// Should return the app name.
				name: function(){
					var pkg = grunt.file.readJSON('package.json');
					return pkg.name;
				},

				// Set an app icon at various sizes (optional)
				icons: {
					ios: {
						icon29: 'icon29.png',
						icon29x2: 'icon29x2.png',
						icon40: 'icon40.png',
						icon40x2: 'icon40x2.png',
						icon57: 'icon57.png',
						icon57x2: 'icon57x2.png',
						icon60x2: 'icon60x2.png',
						icon72: 'icon72.png',
						icon72x2: 'icon72x2.png',
						icon76: 'icon76.png',
						icon76x2: 'icon76x2.png'
					}
				},

				// Set a splash screen at various sizes (optional)
				// Only works for Android and IOS
				screens: {
					ios: {
						// ipad landscape
						ipadLand: 'screen-ipad-landscape.png',
						ipadLandx2: 'screen-ipad-landscape-2x.png',
						// ipad portrait
						ipadPortrait: 'screen-ipad-portrait.png',
						ipadPortraitx2: 'screen-ipad-portrait-2x.png',
						// iphone portrait
						iphonePortrait: 'screen-iphone-portrait.png',
						iphonePortraitx2: 'screen-iphone-portrait-2x.png',
						iphone568hx2: 'screen-iphone-568h-2x.png'
					}
				},

				// Android-only integer version to increase with each release.
				// See http://developer.android.com/tools/publishing/versioning.html
				versionCode: function(){ return(1) },

				// iOS7-only options that will make the status bar white and transparent
				iosStatusBar: 'WhiteAndTransparent',

				// If you want to use the Phonegap Build service to build one or more
				// of the platforms specified above, include these options.
				// See https://build.phonegap.com/
				remote: {
					username: 'kardinal3094@gmail.com',
					password: 'Aues300694$$$',
					platforms: ['ios']
				}
			}
		}
	})

	grunt.loadNpmTasks('grunt-phonegap');
};
