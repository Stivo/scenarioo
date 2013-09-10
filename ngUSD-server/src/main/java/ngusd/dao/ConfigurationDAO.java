package ngusd.dao;

import java.io.File;
import java.net.URISyntaxException;
import java.net.URL;

import ngusd.dao.filesystem.XMLFileUtil;
import ngusd.model.configuration.Configuration;

import org.apache.commons.lang3.StringUtils;

/**
 * DAO for accessing USD configuration data from filesysem.
 */
public class ConfigurationDAO {
	
	private static final String DEFAULT_CONFIG_PATH = "config.xml";
	private static Configuration configuration = loadConfiguration();
	
	public static Configuration getConfiguration() {
		return configuration;
	}
	
	private static Configuration loadConfiguration() {
		File configFile = getConfigFile();
		if (!configFile.exists()) {
			configFile = getDefaultConfigFile();
		}
		return XMLFileUtil.unmarshal(configFile, Configuration.class);
	}
	
	public static Configuration updateConfiguration(final Configuration configuration) {
		File configFile = getConfigFile();
		File ngusdConfigDirectory = configFile.getParentFile();
		boolean dirCreated = ngusdConfigDirectory.mkdirs();
		if (!dirCreated) {
			throw new RuntimeException("Could not create configuration directory: "
					+ ngusdConfigDirectory.getAbsolutePath());
		}
		XMLFileUtil.marshal(configuration, configFile, Configuration.class);
		ConfigurationDAO.configuration = loadConfiguration();
		return configuration;
	}
	
	/**
	 * Get the place where customized configuration file is or will be stored
	 * (as soon as first configuration change has been applied).
	 */
	private static File getConfigFile() {
		String userHomeDir = System.getProperty("user.home");
		if (StringUtils.isBlank(userHomeDir)) {
			userHomeDir = "";
		}
		File userHomePath = new File(userHomeDir);
		File ngusdConfigDirectory = new File(userHomePath, ".ngusd");
		File configFile = new File(ngusdConfigDirectory, "config.xml");
		return configFile;
	}
	
	private static File getDefaultConfigFile() {
		URL resourceUrl = ConfigurationDAO.class.getClassLoader().getResource(DEFAULT_CONFIG_PATH);
		File defaultConfigFile = null;
		try {
			defaultConfigFile = new File(resourceUrl.toURI());
		} catch (URISyntaxException e) {
			throw new IllegalStateException("Default configuration file is not accessable.", e);
		}
		if (defaultConfigFile == null || !defaultConfigFile.exists()) {
			throw new IllegalStateException("Default configuration file is missing.");
		}
		return defaultConfigFile;
	}
	
}
