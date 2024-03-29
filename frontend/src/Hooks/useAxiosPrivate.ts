import useAuth from './useAuth';
import useRefreshToken from './useRefreshToken';
import { useEffect } from 'react';
import { axiosPrivate } from '../APIs/Axios';
const useAxiosPrivate = () => {
	const refresh = useRefreshToken();
	const { auth }: any = useAuth();

	useEffect(() => {
		const requestIntercept = axiosPrivate.interceptors.request.use(
			(config: any) => {
				if (!config.headers['Authorization']) {
					config.headers['Authorization'] = auth.accessToken;
				}
				return config;
			},
			(error: any) => Promise.reject(error)
		);

		const responseIntercept = axiosPrivate.interceptors.response.use(
			async (response) => {
				//console.log(response);
				return response;
			},
			async (error) => {
				//console.log(error);
				const prevRequest = error.config;
				if (error?.response?.status === 403 && !prevRequest.sent) {
					prevRequest.sent = true;
					const newAccessToken = await refresh();
					prevRequest.headers['Authorization'] = newAccessToken;
					return axiosPrivate(prevRequest);
				}
				//onsole.log(error);
				return Promise.reject(error);
			}
		);

		return () => {
			axiosPrivate.interceptors.request.eject(requestIntercept);
			axiosPrivate.interceptors.response.eject(responseIntercept);
		};
	}, [auth, refresh]);

	return axiosPrivate;
};

export default useAxiosPrivate;
