import { Amplify } from 'aws-amplify';

// Centralized Amplify Auth configuration. Import this module early (before any
// modules that call Auth.signIn) so the Auth UserPool is configured when used.
Amplify.configure({
	Auth: {
		region: 'ap-southeast-2',
		userPoolId: 'ap-southeast-2_aDll8F8yq',
		userPoolWebClientId: '6ktcfi5mi15ktlafc0cq562rfj',
		authenticationFlowType: 'USER_PASSWORD_AUTH'
	}
});

