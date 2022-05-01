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
    pageApi             = deviceDriver.mMapping.makePage( pageName );

    this.name           = pageName;
    this.subpageArea    = [ ];

    /**
     * Create a subpage area.
     *
     * @param   subpageAreaName Text name for the subpage.
     */
    function SubPageArea( subpageAreaName )
    {
        subPageAreaApi      = pageApi.makeSubPageArea( subpageAreaName );
        this.subPage        = [ ];

        /**
         * Create a subpage.
         *
         * @param   subPageName Text name for the subpage.
         */
        function Subpage( subPageName )
        {
            subPageApi      = subPageAreaApi.makeSubPage( subPageName );

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
                console.log( 'Subpage ' + subPageName )
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

module.exports =
{
    page:
    {
        makePage:   DriverPage
    }
}
