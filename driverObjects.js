/**
 * @file    driverObjects.js
 *
 * This file is under development. The intent is to provide a
 * better separation of driver core from user configuration. The
 * end goal is to provide a simpler and potentially data-driven
 * design, largely free of the details of the MIDI Remote API.
 *
 * This should be considered advanced development and will
 * change significantly over a relatively short time span.
 *
 * NOTE: IT IS IMPORTANT NOT TO CONFUSE THE MIDI REMOTE API
 * DATA WITH THE THIS FRAMEWORK!
 */


/**
 * Create a driver page instance. Currently the page
 * is built with a fixed number of subpage areas and subpages.
 *
 * @todo Configurable number of subpage areas and subpages.
 *
 * @param deviceDriver MIDI Remote API driver instance.
 * @param pageName          Text page name.
 * @param numSubpageAreas   Number of subpage areas to create.
 * @param numSubPages       Number of subpages per subpage area.
 */
function DriverPage( deviceDriver, pageName, numSubpageAreas, numSubPages )
{
    var pageApi         = deviceDriver.mMapping.makePage( pageName );

    this.name           = pageName;
    this.subpageArea    = [ ];

    /**
     * Create a subpage area.
     *
     * @param   subpageAreaName Text name for the subpage.
     */
    function SubPageArea( subpageAreaName )
    {
        var subPageAreaApi  = pageApi.makeSubPageArea( subpageAreaName );
        this.subPage        = [ ];

        /**
         * Create a subpage.
         *
         * @param   subPageName Text name for the subpage.
         */
        function Subpage( subPageName )
        {
            var subPageApi  = subPageAreaApi.makeSubPage( subPageName );

            /**
             * Callback for subpage activated.
             */
            subPageApi.mOnActivate = function( context )
            {
                console.log( 'Subpage ' + subPageName )
            }
            /**
             * Callback for subpage deactivated.
             */
            subPageApi.mOnDeactivate = function( context )
            {
            }
        }

        for( var i = 0; i < numSubPages; ++i )
        {
            this.subPage[ i ] = new Subpage( 'Subpage ' + i.toString(  ) )
        }

    }

    /**
     * Call for page activated.
     */
    pageApi.mOnActivate = function( context )
    {
        console.log( 'Page ' +  pageName )
    }
    /**
     * Call for page deactivated.
     */
    pageApi.mOnDeactivate = function( context )
    {
    }

    for( var i = 0; i < numSubpageAreas; ++i )
    {
        this.subpageArea[ i ] = new SubPageArea( 'SubPageArea ' + i.toString( ) );
    }
}

function Button( deviceDriver, x, y, w, h )
{
    this.buttonApi = deviceDriver.mSurface.makeButton( x, y, w, h );
    //knobs.push( this );
}

function Knob( deviceDriver, x, y, w, h )
{
    this.knobApi = deviceDriver.mSurface.makeKnob( x, y, w, h )
    //knobs.push( this );

}

function Fader( deviceDriver, x, y, w, h )
{
    this.faderApi = deviceDriver.mSurface.makeFader( x, y, w, h )
    //faders.push( this );

    this.faderApi.mSurfaceValue.mOnTitleChange = function( context, objectTitle, valueTitle )
    {
    }
    this.faderApi.mSurfaceValue.mOnColorChange = function( context, r, g, b, a, IsActive )
    {
    }
    this.faderApi.mSurfaceValue.mOnDisplayValueChange = function( context, value,  units )
    {
    }
    this.faderApi.mSurfaceValue.mOnProcessValueChange = function( context, value )
    {
    }
}

function Label( deviceDriver, x, y, w, h )
{
    this.labelApi = deviceDriver.mSurface.makeLabelField( x, y, w, h )

}


function TriggerPad( deviceDriver, x, y, w, h ) {
    this.triggerPadApi = deviceDriver.mSurface.makeTriggerPad( x, y, w, h )

}

function PianoKeys( deviceDriver, x, y, w, h, first, last )
{
    this.pianoKeysApi = deviceDriver.mSurface.makePianoKeys( x, y, w, h, first, last )
}

function BlindPanel( deviceDriver, x, y, w, h )
{
    thisBlindPanelApi = deviceDriver.mSurface.makeBlindPanel( x, y, w, h )
}


function PitchWheel( deviceDriver, x, y, w, h )
{
    thisPitchWheelApi = deviceDriver.mSurface.makePitchBend( x, y, w, h )
}


function ModWheel( deviceDriver, x, y, w, h )
{
    thisModWheelApi = deviceDriver.mSurface.makeModWheel( x, y, w, h )
}


module.exports =
{
    page:
    {
        makePage:       DriverPage
    },
    surface:
    {
        makeModWheel:   ModWheel,
        makePitchWheel: PitchWheel,
        makeBlindPanel: BlindPanel,
        makePianoKeys:  PianoKeys,
        makeTriggerPad: TriggerPad,
        makeLabel:      Label,
        makeFader:      Fader,
        makeKnob:       Knob,
        makeButton:     Button,
    }
}
