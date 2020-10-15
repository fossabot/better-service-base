const FS = require( 'fs' );
const PATH = require( 'path' );
const TOOLS = require( '@bettercorp/tools/lib/Tools' );
let PLUGIN_CWD = process.cwd();
let CWD = process.cwd();

console.log( `InstallPlugin CWD: ${CWD}` )

let pluginPackageJSON = null;
if ( CWD.indexOf( '@bettercorp' ) >= 0 ) {
  CWD = PATH.join( CWD, '../../../' );
  pluginPackageJSON = JSON.parse( FS.readFileSync( PATH.join( PLUGIN_CWD, './package.json' ) ).toString() )
}

if ( pluginPackageJSON === null ) return 'Unknown script service-base install plugin script'

console.log( `INSTALL SCRIPT FOR ${pluginPackageJSON.name} in ${CWD}` );

const packaggeJSONFile = PATH.join( CWD, './package.json' );
let pluginName = pluginPackageJSON.name;
if ( FS.existsSync( packaggeJSONFile ) ) {
  let jsonString = FS.readFileSync( packaggeJSONFile ).toString();
  let jsonOBJ = JSON.parse( jsonString );
  if ( jsonOBJ.name.indexOf( '@bettercorp/service-base' ) === 0 )
    return console.log( 'Self install. ignoring install script.' );

  pluginName = pluginPackageJSON.name.split( '@bettercorp/service-base-' )[ 1 ];

  jsonOBJ[ 'bettercorp-service-base' ] = jsonOBJ[ 'bettercorp-service-base' ] || {};
  const iPluginPath = PATH.join( PLUGIN_CWD, './lib/plugins' );
  if ( FS.existsSync( iPluginPath ) && FS.statSync( iPluginPath ).isDirectory() ) {
    for ( let iPluginName of FS.readdirSync( iPluginPath ) ) {
      const iFullPluginName = `plugin-${iPluginName}`;
      jsonOBJ[ 'bettercorp-service-base' ][ iFullPluginName ] = jsonOBJ[ 'bettercorp-service-base' ][ iFullPluginName ] || false;
      if ( jsonOBJ[ 'bettercorp-service-base' ][ iFullPluginName ] === false )
        console.log( ` Automatically added config to package.json for you .... the plugin[${iFullPluginName}] is disabled ... go into your packge.json to enable it` )
    }
  } else {
    jsonOBJ[ 'bettercorp-service-base' ][ pluginName ] = jsonOBJ[ 'bettercorp-service-base' ][ pluginName ] || false;
    if ( jsonOBJ[ 'bettercorp-service-base' ][ pluginName ] === false )
      console.log( ` Automatically added config to package.json for you .... the plugin[${pluginName}] is disabled ... go into your packge.json to enable it` )
  }
  let outJSONString = JSON.stringify( jsonOBJ );
  if ( outJSONString !== jsonString ) {
    FS.writeFileSync( packaggeJSONFile, outJSONString )
  }
}

const configFile = PATH.join( CWD, './sec.config.json' );
if ( !FS.existsSync( configFile ) ) {
  console.log( `Creating config file... (${configFile})` );
  FS.writeFileSync( configFile, '{}' );
}

const installScriptPath = PATH.join( PLUGIN_CWD, './installer.js' );
if ( FS.existsSync( installScriptPath ) ) {
  console.log( `Checking config entries... (${configFile})` );
  let pluginScript = require( installScriptPath );
  if ( pluginScript.default !== undefined )
    pluginScript = pluginScript.default;

  let configString = FS.readFileSync( configFile ).toString();
  let configJSON = JSON.parse( configString ) || {};
  configJSON.plugins = configJSON.plugins || {};
  configJSON.plugins[ pluginName ] = configJSON.plugins[ pluginName ] || {};

  let pluginMadeConfig = pluginScript();
  configJSON.plugins[ pluginName ] = TOOLS.Tools.mergeObjects( pluginMadeConfig, configJSON.plugins[ pluginName ] );

  let outConfigString = JSON.stringify( configJSON );

  if ( outConfigString !== configString ) {
    console.log( `Updating config file... (${configFile})` );
    FS.writeFileSync( configFile, outConfigString );
  }
}

console.log( `INSTALL COMPLETE FOR ${pluginPackageJSON.name}` );